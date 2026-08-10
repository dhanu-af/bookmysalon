import { addMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import { db } from "@/lib/db";
import { dateStrInZone } from "@/lib/date";
import { computeSlotsForWindow, minutesFromMidnightInZone, minutesToHHmm, type BusyInterval } from "./slots";

export interface AvailableSlot {
  startAt: Date;
  endAt: Date;
  barberId: string;
  barberName: string;
}

/**
 * All bookable slots for a service at a salon on one local calendar date.
 * Considers: salon opening hours, barber working hours + recurring breaks,
 * existing (non-cancelled) bookings, and one-off blocked time — per the
 * spec's availability requirements. Pass `barberId` to scope to one barber,
 * omit it for "any available barber" (returns every eligible barber's slots).
 */
export async function getAvailableSlots(params: {
  salonId: string;
  serviceId: string;
  /** Local calendar date at the salon, e.g. "2026-08-10" — NOT a UTC instant. */
  dateStr: string;
  barberId?: string;
}): Promise<AvailableSlot[]> {
  const salon = await db.salon.findUniqueOrThrow({ where: { id: params.salonId } });
  const service = await db.service.findUniqueOrThrow({ where: { id: params.serviceId } });

  // A date-only ISO string parses as UTC midnight regardless of server tz —
  // safe for a pure calendar day-of-week lookup, no zone conversion needed.
  const dayOfWeek = new Date(params.dateStr).getUTCDay();

  const openingHours = await db.openingHours.findUnique({
    where: { salonId_dayOfWeek: { salonId: params.salonId, dayOfWeek } },
  });
  if (!openingHours || openingHours.isClosed || openingHours.openMin == null || openingHours.closeMin == null) {
    return [];
  }

  const barbers = await db.barber.findMany({
    where: {
      salonId: params.salonId,
      active: true,
      bookableOnline: true,
      ...(params.barberId ? { id: params.barberId } : {}),
      barberServices: { some: { serviceId: params.serviceId } },
    },
    include: {
      workingHours: { where: { dayOfWeek } },
      breaks: { where: { dayOfWeek } },
    },
  });
  if (barbers.length === 0) return [];

  const dayStartUtc = fromZonedTime(`${params.dateStr}T00:00:00`, salon.timezone);
  const dayEndUtc = fromZonedTime(`${params.dateStr}T23:59:59.999`, salon.timezone);
  const nowMinutes = dateStrInZone(new Date(), salon.timezone) === params.dateStr
    ? minutesFromMidnightInZone(new Date(), salon.timezone)
    : undefined;

  const results: AvailableSlot[] = [];

  for (const barber of barbers) {
    const wh = barber.workingHours[0];
    if (!wh || wh.isOff || wh.startMin == null || wh.endMin == null) continue;

    // A barber can't work outside the salon's own opening hours.
    const windowStart = Math.max(wh.startMin, openingHours.openMin);
    const windowEnd = Math.min(wh.endMin, openingHours.closeMin);
    if (windowStart >= windowEnd) continue;

    const busy: BusyInterval[] = barber.breaks.map((b) => ({ start: b.startMin, end: b.endMin }));

    const [bookings, blockedTimes] = await Promise.all([
      db.booking.findMany({
        where: {
          barberId: barber.id,
          status: { notIn: ["CANCELLED", "NO_SHOW"] },
          startAt: { lt: dayEndUtc },
          endAt: { gt: dayStartUtc },
        },
      }),
      db.blockedTime.findMany({
        where: {
          salonId: params.salonId,
          OR: [{ barberId: barber.id }, { barberId: null }],
          startAt: { lt: dayEndUtc },
          endAt: { gt: dayStartUtc },
        },
      }),
    ]);

    for (const interval of [...bookings, ...blockedTimes]) {
      // Clamp anything spanning outside today's window (e.g. an overnight
      // block) to today's boundaries rather than computing a wrapped-around
      // local minute value.
      const start = interval.startAt < dayStartUtc ? 0 : minutesFromMidnightInZone(interval.startAt, salon.timezone);
      const end = interval.endAt > dayEndUtc ? 24 * 60 : minutesFromMidnightInZone(interval.endAt, salon.timezone);
      busy.push({ start, end });
    }

    const slotStarts = computeSlotsForWindow({
      windowStart,
      windowEnd,
      durationMinutes: service.durationMinutes,
      busy,
      nowMinutes,
    });

    for (const slotStart of slotStarts) {
      const startAt = fromZonedTime(`${params.dateStr}T${minutesToHHmm(slotStart)}:00`, salon.timezone);
      const endAt = addMinutes(startAt, service.durationMinutes);
      results.push({ startAt, endAt, barberId: barber.id, barberName: barber.name });
    }
  }

  return results.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}
