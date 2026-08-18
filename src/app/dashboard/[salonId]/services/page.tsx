import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { formatPriceCents, formatDuration } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ServiceDialog } from "./service-dialog";
import { fraunces } from "@/lib/fonts";

export default async function ServicesPage({ params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params;
  await requireSalonOwner(salonId);
  const services = await db.service.findMany({ where: { salonId }, orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className={`${fraunces.className} text-2xl font-semibold text-stone-900`}>Services</h1>
        <ServiceDialog salonId={salonId} />
      </div>
      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
            <div>
              <p className={`${fraunces.className} font-semibold text-stone-900`}>
                {s.name} {!s.active && <Badge variant="destructive">Inactive</Badge>}
              </p>
              <p className="text-sm text-stone-500">{formatDuration(s.durationMinutes)}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className={`${fraunces.className} font-semibold text-stone-900`}>{formatPriceCents(s.priceCents)}</p>
              <ServiceDialog salonId={salonId} existing={s} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
