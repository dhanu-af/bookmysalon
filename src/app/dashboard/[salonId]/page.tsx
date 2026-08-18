import { requireSalonStaff } from "@/lib/session";
import { getTodayStats } from "@/lib/dashboard/stats";
import { RunningStatusWidget } from "./running-status-widget";
import { fraunces } from "@/lib/fonts";

export default async function SalonDashboardPage({ params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params;
  const { staff } = await requireSalonStaff(salonId);
  const { counts, nextAppointment, salon } = await getTodayStats(salonId, staff);

  return (
    <div>
      <h1 className={`${fraunces.className} mb-6 text-2xl font-semibold text-stone-900`}>Today</h1>

      <RunningStatusWidget salonId={salonId} current={salon.runningStatus} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Bookings" value={counts.total} />
        <StatCard label="Completed" value={counts.completed} />
        <StatCard label="Upcoming" value={counts.upcoming} />
        <StatCard label="Cancelled" value={counts.cancelled} />
        <StatCard label="No-shows" value={counts.noShow} />
      </div>

      <h2 className={`${fraunces.className} mb-3 mt-8 text-lg font-semibold text-stone-900`}>Next Appointment</h2>
      {nextAppointment ? (
        <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
          <p className="font-medium text-stone-900">{nextAppointment.barber.name}</p>
          <p className="text-sm text-stone-500">
            {nextAppointment.serviceNameSnapshot} · {formatTime(nextAppointment.startAt, salon.timezone)}
          </p>
          <p className="text-sm text-stone-500">Customer: {nextAppointment.guestName}</p>
        </div>
      ) : (
        <p className="text-sm text-stone-500">No upcoming appointments today.</p>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 text-center shadow-sm">
      <p className={`${fraunces.className} text-2xl font-bold text-stone-900`}>{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  );
}

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);
}
