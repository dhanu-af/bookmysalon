import Link from "next/link";
import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { AddBarberDialog } from "./add-barber-dialog";
import { fraunces } from "@/lib/fonts";

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
          <h1 className={`${fraunces.className} text-2xl font-semibold text-stone-900`}>Barbers</h1>
          <p className="text-sm text-stone-500">
            {onlineCount} / {limit} online-bookable slots used
          </p>
        </div>
        <AddBarberDialog salonId={salonId} atLimit={onlineCount >= limit} />
      </div>

      <div className="space-y-2">
        {barbers.map((barber) => (
          <Link
            key={barber.id}
            href={`/dashboard/${salonId}/barbers/${barber.id}`}
            className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-stone-200 hover:shadow-md"
          >
            <div>
              <p className={`${fraunces.className} font-semibold text-stone-900`}>{barber.name}</p>
              <p className="text-sm text-stone-500">{barber.title ?? "Barber"}</p>
            </div>
            <div className="flex gap-2">
              {barber.bookableOnline && <Badge>Online</Badge>}
              {!barber.active && <Badge variant="destructive">Inactive</Badge>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
