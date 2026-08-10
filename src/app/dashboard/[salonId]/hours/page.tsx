import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { HoursEditor } from "./hours-editor";

export default async function OpeningHoursPage({ params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params;
  await requireSalonOwner(salonId);
  const openingHours = await db.openingHours.findMany({ where: { salonId }, orderBy: { dayOfWeek: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Opening Hours</h1>
      <HoursEditor salonId={salonId} initialHours={openingHours} />
    </div>
  );
}
