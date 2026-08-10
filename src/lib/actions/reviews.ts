"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function createReview(bookingId: string, rating: number, comment?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to leave a review" };
  if (rating < 1 || rating > 5) return { error: "Rating must be between 1 and 5" };

  const booking = await db.booking.findUnique({ where: { id: bookingId }, include: { review: true } });
  if (!booking || booking.customerId !== session.user.id) return { error: "Booking not found" };
  if (booking.status !== "COMPLETED") return { error: "You can only review a completed appointment" };
  if (booking.review) return { error: "You've already reviewed this booking" };

  await db.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        bookingId: booking.id,
        salonId: booking.salonId,
        barberId: booking.barberId,
        customerId: session.user.id,
        rating,
        comment,
      },
    });

    // Recompute denormalized aggregates from scratch — simplest correct
    // approach at this scale, avoids incremental-average rounding drift.
    const [salonAgg, barberAgg] = await Promise.all([
      tx.review.aggregate({ where: { salonId: booking.salonId }, _avg: { rating: true }, _count: true }),
      tx.review.aggregate({ where: { barberId: booking.barberId }, _avg: { rating: true }, _count: true }),
    ]);

    await tx.salon.update({
      where: { id: booking.salonId },
      data: { avgRating: salonAgg._avg.rating ?? 0, reviewCount: salonAgg._count },
    });
    await tx.barber.update({
      where: { id: booking.barberId },
      data: { avgRating: barberAgg._avg.rating ?? 0, reviewCount: barberAgg._count },
    });
  });

  revalidatePath("/account/bookings");
  return { success: true };
}
