import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfNextWeek = new Date(startOfWeek);
  startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [totalSalons, activeSalons, pendingSalons, totalCustomers, bookingsToday, bookingsWeek, bookingsMonth] = await Promise.all([
    db.salon.count(),
    db.salon.count({ where: { approvalStatus: "APPROVED" } }),
    db.salon.count({ where: { approvalStatus: "PENDING_APPROVAL" } }),
    db.user.count(),
    db.booking.count({ where: { startAt: { gte: startOfToday, lt: startOfTomorrow } } }),
    db.booking.count({ where: { startAt: { gte: startOfWeek, lt: startOfNextWeek } } }),
    db.booking.count({ where: { startAt: { gte: startOfMonth, lt: startOfNextMonth } } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Platform Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Salons" value={totalSalons} />
        <StatCard label="Active Salons" value={activeSalons} />
        <StatCard label="Pending Approval" value={pendingSalons} />
        <StatCard label="Total Users" value={totalCustomers} />
        <StatCard label="Bookings Today" value={bookingsToday} />
        <StatCard label="Bookings This Week" value={bookingsWeek} />
        <StatCard label="Bookings This Month" value={bookingsMonth} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
