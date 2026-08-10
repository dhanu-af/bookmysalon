import { notFound } from "next/navigation";
import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { BarberEditor } from "./barber-editor";

export default async function BarberDetailPage({ params }: { params: Promise<{ salonId: string; barberId: string }> }) {
  const { salonId, barberId } = await params;
  await requireSalonOwner(salonId);

  const [barber, services, barberServices] = await Promise.all([
    db.barber.findFirst({
      where: { id: barberId, salonId },
      include: { workingHours: { orderBy: { dayOfWeek: "asc" } }, breaks: true },
    }),
    db.service.findMany({ where: { salonId, active: true }, orderBy: { name: "asc" } }),
    db.barberService.findMany({ where: { barberId } }),
  ]);
  if (!barber) notFound();

  return (
    <BarberEditor
      salonId={salonId}
      barber={barber}
      services={services}
      selectedServiceIds={barberServices.map((bs) => bs.serviceId)}
    />
  );
}
