import { db } from "@/lib/db";
import { bookingScopeForStaff } from "@/lib/session";
import { dateStrInZone } from "@/lib/date";
import { fromZonedTime } from "date-fns-tz";

export async function getTodayStats(salonId: string, staff: { role: "OWNER" | "BARBER"; barberId: string | null }) {
  const salon = await db.salon.findUniqueOrThrow({ where: { id: salonId } });
  const todayStr = dateStrInZone(new Date(), salon.timezone);
  const dayStart = fromZonedTime(`${todayStr}T00:00:00`, salon.timezone);
  const dayEnd = fromZonedTime(`${todayStr}T23:59:59.999`, salon.timezone);

  const scope = bookingScopeForStaff(staff);
  const todaysBookings = await db.booking.findMany({
    where: { salonId, ...scope, startAt: { gte: dayStart, lte: dayEnd } },
  });

  const counts = {
    total: todaysBookings.length,
    completed: todaysBookings.filter((b) => b.status === "COMPLETED").length,
    upcoming: todaysBookings.filter((b) => ["PENDING", "CONFIRMED", "ARRIVED", "IN_SERVICE"].includes(b.status) && b.startAt.getTime() >= Date.now())
      .length,
    cancelled: todaysBookings.filter((b) => b.status === "CANCELLED").length,
    noShow: todaysBookings.filter((b) => b.status === "NO_SHOW").length,
  };

  const nextAppointment = await db.booking.findFirst({
    where: {
      salonId,
      ...scope,
      status: { in: ["PENDING", "CONFIRMED", "ARRIVED"] },
      startAt: { gte: new Date() },
    },
    orderBy: { startAt: "asc" },
    include: { barber: true },
  });

  return { counts, nextAppointment, salon };
}
