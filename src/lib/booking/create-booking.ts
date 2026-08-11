"use server";

import { addMinutes } from "date-fns";

import { db } from "@/lib/db";
import { getAvailableSlots } from "./availability";
import { generateUniqueReference } from "./reference";
import { isExclusionViolation } from "./exclusion-error";
import { sendBookingConfirmationEmail } from "@/lib/notifications/booking-emails";
import { sendBookingConfirmationSms } from "@/lib/notifications/booking-sms";

export interface CreateBookingInput {
  salonId: string;
  serviceId: string;
  /** Omit for "any available barber" — resolved server-side right before insert. */
  barberId?: string;
  /** Local calendar date, e.g. "2026-08-10" — must match the slot's date. */
  dateStr: string;
  startAt: Date;
  customerId?: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  source?: "ONLINE" | "WALK_IN" | "ADMIN";
}

export type CreateBookingResult = { booking: { id: string; reference: string } } | { error: string };

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const service = await db.service.findUnique({ where: { id: input.serviceId } });
  if (!service || !service.active) return { error: "This service is no longer available" };

  // Re-derive real-time availability right before writing — never trust a
  // slot list the client fetched earlier, it may be stale by now.
  const freshSlots = await getAvailableSlots({
    salonId: input.salonId,
    serviceId: input.serviceId,
    dateStr: input.dateStr,
    barberId: input.barberId,
  });

  const match = freshSlots.find(
    (s) => s.startAt.getTime() === input.startAt.getTime() && (!input.barberId || s.barberId === input.barberId)
  );
  if (!match) {
    return { error: "That time is no longer available. Please choose another slot." };
  }

  const barberId = match.barberId; // resolves "any barber" to a concrete barber
  const endAt = addMinutes(input.startAt, service.durationMinutes);
  const reference = await generateUniqueReference();

  try {
    const booking = await db.booking.create({
      data: {
        reference,
        salonId: input.salonId,
        barberId,
        serviceId: input.serviceId,
        customerId: input.customerId,
        guestName: input.guestName,
        guestPhone: input.guestPhone,
        guestEmail: input.guestEmail,
        startAt: input.startAt,
        endAt,
        serviceNameSnapshot: service.name,
        priceCentsSnapshot: service.priceCents,
        durationMinutesSnapshot: service.durationMinutes,
        status: "CONFIRMED",
        source: input.source ?? "ONLINE",
      },
      select: { id: true, reference: true },
    });
    if (input.guestEmail) {
      // Fire-and-forget: a slow/failed email must never block the booking
      // itself from confirming — failures are recorded on the Notification
      // row (status FAILED) for later inspection, not surfaced to the customer.
      sendBookingConfirmationEmail(booking.id).catch((e) => console.error("Failed to send booking confirmation email", e));
    }
    // No-ops (logged) unless the salon's plan has smsEnabled — see booking-sms.ts.
    sendBookingConfirmationSms(booking.id).catch((e) => console.error("Failed to send booking confirmation SMS", e));
    return { booking };
  } catch (e) {
    if (isExclusionViolation(e)) {
      return { error: "That time was just booked by someone else. Please choose another slot." };
    }
    throw e;
  }
}
