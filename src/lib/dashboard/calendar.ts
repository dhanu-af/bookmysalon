import { fromZonedTime } from "date-fns-tz";
import { db } from "@/lib/db";
import { minutesToHHmm } from "@/lib/booking/slots";

export interface CalendarCell {
  status: "available" | "booked" | "blocked" | "closed";
  label?: string;
  bookingId?: string;
}

export interface CalendarGrid {
  timeLabels: string[]; // "9:00 AM" etc, one per row
  barbers: { id: string; name: string }[];
  rows: CalendarCell[][]; // rows[timeIndex][barberIndex]
}

const GRID_STEP_MIN = 30;

export async function getDailyCalendar(salonId: string, dateStr: string): Promise<CalendarGrid> {
  const salon = await db.salon.findUniqueOrThrow({ where: { id: salonId } });
  const dayOfWeek = new Date(dateStr).getUTCDay();

  const [openingHours, barbers] = await Promise.all([
    db.openingHours.findUnique({ where: { salonId_dayOfWeek: { salonId, dayOfWeek } } }),
    db.barber.findMany({ where: { salonId, active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!openingHours || openingHours.isClosed || openingHours.openMin == null || openingHours.closeMin == null) {
    return { timeLabels: [], barbers: barbers.map((b) => ({ id: b.id, name: b.name })), rows: [] };
  }

  const dayStart = fromZonedTime(`${dateStr}T00:00:00`, salon.timezone);
  const dayEnd = fromZonedTime(`${dateStr}T23:59:59.999`, salon.timezone);

  const [bookings, blockedTimes] = await Promise.all([
    db.booking.findMany({
      where: { salonId, status: { notIn: ["CANCELLED", "NO_SHOW"] }, startAt: { lt: dayEnd }, endAt: { gt: dayStart } },
    }),
    db.blockedTime.findMany({ where: { salonId, startAt: { lt: dayEnd }, endAt: { gt: dayStart } } }),
  ]);

  const timeLabels: string[] = [];
  const rows: CalendarCell[][] = [];

  for (let min = openingHours.openMin; min < openingHours.closeMin; min += GRID_STEP_MIN) {
    timeLabels.push(formatLabel(min));
    const slotStart = fromZonedTime(`${dateStr}T${minutesToHHmm(min)}:00`, salon.timezone);
    const slotEnd = fromZonedTime(`${dateStr}T${minutesToHHmm(min + GRID_STEP_MIN)}:00`, salon.timezone);

    const row: CalendarCell[] = barbers.map((barber) => {
      const booking = bookings.find((b) => b.barberId === barber.id && b.startAt < slotEnd && b.endAt > slotStart);
      if (booking) return { status: "booked", label: `${booking.guestName} — ${booking.serviceNameSnapshot}`, bookingId: booking.id };

      const blocked = blockedTimes.find(
        (bt) => (bt.barberId === barber.id || bt.barberId === null) && bt.startAt < slotEnd && bt.endAt > slotStart
      );
      if (blocked) return { status: "blocked", label: blocked.reason };

      return { status: "available" };
    });
    rows.push(row);
  }

  return { timeLabels, barbers: barbers.map((b) => ({ id: b.id, name: b.name })), rows };
}

function formatLabel(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}
