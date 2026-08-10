"use server";

import { addMinutes } from "date-fns";
import { revalidatePath } from "next/cache";
import { requireSalonStaff } from "@/lib/session";
import { db } from "@/lib/db";
import { generateUniqueReference } from "@/lib/booking/reference";
import { isExclusionViolation } from "@/lib/booking/exclusion-error";
import type { BookingStatus } from "@/generated/prisma/client";

export async function addWalkIn(
  salonId: string,
  input: { barberId: string; serviceId: string; startAt: Date; guestName: string; guestPhone?: string }
) {
  await requireSalonStaff(salonId);

  const service = await db.service.findUniqueOrThrow({ where: { id: input.serviceId } });
  const endAt = addMinutes(input.startAt, service.durationMinutes);
  const reference = await generateUniqueReference();

  try {
    await db.booking.create({
      data: {
        reference,
        salonId,
        barberId: input.barberId,
        serviceId: input.serviceId,
        guestName: input.guestName || "Walk-in",
        guestPhone: input.guestPhone || "N/A",
        startAt: input.startAt,
        endAt,
        serviceNameSnapshot: service.name,
        priceCentsSnapshot: service.priceCents,
        durationMinutesSnapshot: service.durationMinutes,
        status: "CONFIRMED",
        source: "WALK_IN",
      },
    });
  } catch (e) {
    if (isExclusionViolation(e)) {
      return { error: "This barber already has a booking that overlaps this time." };
    }
    throw e;
  }

  revalidatePath(`/dashboard/${salonId}/bookings`);
  revalidatePath(`/dashboard/${salonId}/calendar`);
  return { success: true };
}

export async function updateBookingStatus(bookingId: string, salonId: string, status: BookingStatus) {
  const { staff } = await requireSalonStaff(salonId);

  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } });
  if (staff.role === "BARBER" && booking.barberId !== staff.barberId) {
    return { error: "You can only update your own bookings" };
  }

  await db.booking.update({
    where: { id: bookingId },
    data: {
      status,
      checkedInAt: status === "ARRIVED" ? new Date() : booking.checkedInAt,
      cancelledAt: status === "CANCELLED" ? new Date() : booking.cancelledAt,
    },
  });
  revalidatePath(`/dashboard/${salonId}/bookings`);
  revalidatePath(`/dashboard/${salonId}/calendar`);
  return { success: true };
}
