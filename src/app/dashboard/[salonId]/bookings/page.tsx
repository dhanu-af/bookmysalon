import { requireSalonStaff, bookingScopeForStaff } from "@/lib/session";
import { db } from "@/lib/db";
import { AddWalkInDialog } from "./add-walk-in-dialog";
import { BookingStatusRow } from "./booking-status-row";

export default async function DashboardBookingsPage({ params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params;
  const { staff } = await requireSalonStaff(salonId);
  const salon = await db.salon.findUniqueOrThrow({ where: { id: salonId } });

  const scope = bookingScopeForStaff(staff);
  const bookings = await db.booking.findMany({
    where: { salonId, ...scope, startAt: { gte: new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000) } },
    include: { barber: true },
    orderBy: { startAt: "asc" },
    take: 100,
  });

  const barbers = await db.barber.findMany({ where: { salonId, active: true, ...(staff.role === "BARBER" ? { id: staff.barberId ?? "" } : {}) } });
  const services = await db.service.findMany({ where: { salonId, active: true } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <AddWalkInDialog salonId={salonId} barbers={barbers} services={services} />
      </div>
      <div className="space-y-2">
        {bookings.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
        {bookings.map((b) => (
          <BookingStatusRow key={b.id} booking={b} salonId={salonId} timezone={salon.timezone} />
        ))}
      </div>
    </div>
  );
}
