import Link from "next/link";
import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddBarberDialog } from "./add-barber-dialog";

export default async function BarbersPage({ params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params;
  await requireSalonOwner(salonId);

  const [barbers, onlineCount, subscription] = await Promise.all([
    db.barber.findMany({ where: { salonId }, orderBy: { createdAt: "asc" } }),
    db.barber.count({ where: { salonId, bookableOnline: true } }),
    db.salonSubscription.findUnique({ where: { salonId }, include: { plan: true } }),
  ]);
  const limit = subscription?.plan.maxOnlineBarbers ?? 2;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Barbers</h1>
          <p className="text-sm text-muted-foreground">
            {onlineCount} / {limit} online-bookable slots used
          </p>
        </div>
        <AddBarberDialog salonId={salonId} atLimit={onlineCount >= limit} />
      </div>

      <div className="space-y-2">
        {barbers.map((barber) => (
          <Link key={barber.id} href={`/dashboard/${salonId}/barbers/${barber.id}`}>
            <Card className="transition hover:border-foreground/30">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{barber.name}</p>
                  <p className="text-sm text-muted-foreground">{barber.title ?? "Barber"}</p>
                </div>
                <div className="flex gap-2">
                  {barber.bookableOnline && <Badge>Online</Badge>}
                  {!barber.active && <Badge variant="destructive">Inactive</Badge>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
