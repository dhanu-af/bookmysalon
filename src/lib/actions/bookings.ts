"use server";

import { addMinutes } from "date-fns";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getAvailableSlots } from "@/lib/booking/availability";
import { isExclusionViolation } from "@/lib/booking/exclusion-error";

async function requireOwnedBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to manage this booking" as const };

  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.customerId !== session.user.id) {
    return { error: "Booking not found" as const };
  }
  return { booking };
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const result = await requireOwnedBooking(bookingId);
  if ("error" in result) return result;

  if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(result.booking.status)) {
    return { error: "This booking can no longer be cancelled" };
  }

  await db.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason },
  });
  revalidatePath("/account/bookings");
  return { success: true };
}

export async function rescheduleBooking(bookingId: string, dateStr: string, newStartAt: Date) {
  const result = await requireOwnedBooking(bookingId);
  if ("error" in result) return result;
  const booking = result.booking;

  if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status)) {
    return { error: "This booking can no longer be rescheduled" };
  }

  // Re-check real-time availability for this exact barber before writing —
  // the slot list the client fetched may be stale.
  const freshSlots = await getAvailableSlots({ salonId: booking.salonId, serviceId: booking.serviceId, dateStr, barberId: booking.barberId });
  const match = freshSlots.find((s) => s.startAt.getTime() === newStartAt.getTime());
  if (!match) return { error: "That time is no longer available. Please choose another slot." };

  const newEndAt = addMinutes(newStartAt, booking.durationMinutesSnapshot);

  try {
    await db.booking.update({
      where: { id: bookingId },
      data: { startAt: newStartAt, endAt: newEndAt, status: "CONFIRMED" },
    });
  } catch (e) {
    if (isExclusionViolation(e)) {
      return { error: "That time was just booked by someone else. Please choose another slot." };
    }
    throw e;
  }

  revalidatePath("/account/bookings");
  return { success: true };
}
