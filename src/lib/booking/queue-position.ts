import { db } from "@/lib/db";

/**
 * 1-indexed position in the walk-up queue for a checked-in (ARRIVED) booking:
 * whoever the barber is currently serving counts as position 0 (ahead of
 * everyone), then ARRIVED customers are ordered by check-in time. Returns
 * null for a booking that isn't ARRIVED — there's no queue position before
 * check-in or after service starts.
 */
export async function getQueuePosition(bookingId: string): Promise<number | null> {
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status !== "ARRIVED" || !booking.checkedInAt) return null;

  const [inService, aheadInQueue] = await Promise.all([
    db.booking.count({ where: { barberId: booking.barberId, status: "IN_SERVICE" } }),
    db.booking.count({
      where: { barberId: booking.barberId, status: "ARRIVED", checkedInAt: { lt: booking.checkedInAt } },
    }),
  ]);

  return inService + aheadInQueue + 1;
}
