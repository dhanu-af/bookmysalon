import { requireSalonStaff } from "@/lib/session";
import { db } from "@/lib/db";
import { AddBlockedTimeDialog } from "./add-blocked-time-dialog";
import { DeleteBlockedTimeButton } from "./delete-blocked-time-button";
import { fraunces } from "@/lib/fonts";

export default async function BlockedTimesPage({ params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params;
  await requireSalonStaff(salonId);

  const [blockedTimes, barbers, salon] = await Promise.all([
    db.blockedTime.findMany({ where: { salonId, endAt: { gte: new Date() } }, include: { barber: true }, orderBy: { startAt: "asc" } }),
    db.barber.findMany({ where: { salonId, active: true } }),
    db.salon.findUniqueOrThrow({ where: { id: salonId } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className={`${fraunces.className} text-2xl font-semibold text-stone-900`}>Blocked Times</h1>
        <AddBlockedTimeDialog salonId={salonId} barbers={barbers} />
      </div>
      <div className="space-y-2">
        {blockedTimes.length === 0 && <p className="text-sm text-stone-500">No upcoming blocked times.</p>}
        {blockedTimes.map((bt) => (
          <div key={bt.id} className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
            <div>
              <p className={`${fraunces.className} font-semibold text-stone-900`}>{bt.reason}</p>
              <p className="text-sm text-stone-500">
                {bt.barber ? bt.barber.name : "Whole salon"} · {formatRange(bt.startAt, bt.endAt, salon.timezone)}
              </p>
            </div>
            <DeleteBlockedTimeButton blockedTimeId={bt.id} salonId={salonId} />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatRange(start: Date, end: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-AU", { timeZone, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const fmtTimeOnly = new Intl.DateTimeFormat("en-AU", { timeZone, hour: "numeric", minute: "2-digit" });
  return `${fmt.format(start)} – ${fmtTimeOnly.format(end)}`;
}
