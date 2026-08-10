import { db } from "@/lib/db";

export async function getMyBookings(userId: string) {
  const bookings = await db.booking.findMany({
    where: { customerId: userId },
    include: { salon: true, barber: true, review: true },
    orderBy: { startAt: "desc" },
  });

  const now = Date.now();
  const upcoming = bookings.filter((b) => !["CANCELLED", "NO_SHOW", "COMPLETED"].includes(b.status) && b.startAt.getTime() >= now);
  const past = bookings.filter((b) => b.status === "COMPLETED" || (b.startAt.getTime() < now && !["CANCELLED", "NO_SHOW"].includes(b.status)));
  const cancelled = bookings.filter((b) => ["CANCELLED", "NO_SHOW"].includes(b.status));

  return {
    upcoming: upcoming.sort((a, b) => a.startAt.getTime() - b.startAt.getTime()),
    past,
    cancelled,
  };
}
