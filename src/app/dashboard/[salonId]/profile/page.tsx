import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { ProfileEditor } from "./profile-editor";

export default async function SalonProfilePage({ params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params;
  await requireSalonOwner(salonId);
  const salon = await db.salon.findUniqueOrThrow({ where: { id: salonId } });

  return (
    <div className="max-w-lg">
      <h1 className="mb-1 text-2xl font-bold">Salon Profile</h1>
      {salon.approvalStatus === "PENDING_APPROVAL" && (
        <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Your salon is pending admin approval and won&apos;t appear in customer search yet.
        </p>
      )}
      <ProfileEditor salon={salon} />
    </div>
  );
}
