import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { formatPriceCents, formatDuration } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceDialog } from "./service-dialog";

export default async function ServicesPage({ params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params;
  await requireSalonOwner(salonId);
  const services = await db.service.findMany({ where: { salonId }, orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <ServiceDialog salonId={salonId} />
      </div>
      <div className="space-y-2">
        {services.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">
                  {s.name} {!s.active && <Badge variant="destructive">Inactive</Badge>}
                </p>
                <p className="text-sm text-muted-foreground">{formatDuration(s.durationMinutes)}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold">{formatPriceCents(s.priceCents)}</p>
                <ServiceDialog salonId={salonId} existing={s} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
