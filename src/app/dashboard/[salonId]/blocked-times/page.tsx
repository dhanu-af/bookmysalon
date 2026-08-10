import { requireSalonStaff } from "@/lib/session";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { AddBlockedTimeDialog } from "./add-blocked-time-dialog";
import { DeleteBlockedTimeButton } from "./delete-blocked-time-button";

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
        <h1 className="text-2xl font-bold">Blocked Times</h1>
        <AddBlockedTimeDialog salonId={salonId} barbers={barbers} />
      </div>
      <div className="space-y-2">
        {blockedTimes.length === 0 && <p className="text-sm text-muted-foreground">No upcoming blocked times.</p>}
        {blockedTimes.map((bt) => (
          <Card key={bt.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{bt.reason}</p>
                <p className="text-sm text-muted-foreground">
                  {bt.barber ? bt.barber.name : "Whole salon"} · {formatRange(bt.startAt, bt.endAt, salon.timezone)}
                </p>
              </div>
              <DeleteBlockedTimeButton blockedTimeId={bt.id} salonId={salonId} />
            </CardContent>
          </Card>
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
