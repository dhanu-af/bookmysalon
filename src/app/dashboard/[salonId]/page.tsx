import { requireSalonStaff } from "@/lib/session";
import { getTodayStats } from "@/lib/dashboard/stats";
import { Card, CardContent } from "@/components/ui/card";

export default async function SalonDashboardPage({ params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params;
  const { staff } = await requireSalonStaff(salonId);
  const { counts, nextAppointment, salon } = await getTodayStats(salonId, staff);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Today</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Bookings" value={counts.total} />
        <StatCard label="Completed" value={counts.completed} />
        <StatCard label="Upcoming" value={counts.upcoming} />
        <StatCard label="Cancelled" value={counts.cancelled} />
        <StatCard label="No-shows" value={counts.noShow} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Next Appointment</h2>
      {nextAppointment ? (
        <Card>
          <CardContent className="p-4">
            <p className="font-medium">{nextAppointment.barber.name}</p>
            <p className="text-sm text-muted-foreground">
              {nextAppointment.serviceNameSnapshot} · {formatTime(nextAppointment.startAt, salon.timezone)}
            </p>
            <p className="text-sm text-muted-foreground">Customer: {nextAppointment.guestName}</p>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">No upcoming appointments today.</p>
      )}
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

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);
}
