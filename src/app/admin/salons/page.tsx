import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { SalonApprovalActions } from "./salon-approval-actions";
import { fraunces } from "@/lib/fonts";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  APPROVED: "default",
  PENDING_APPROVAL: "secondary",
  REJECTED: "destructive",
  SUSPENDED: "destructive",
};

export default async function AdminSalonsPage() {
  const salons = await db.salon.findMany({
    include: { staff: { where: { role: "OWNER" }, include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className={`${fraunces.className} mb-6 text-2xl font-semibold text-stone-900`}>Salons</h1>
      <div className="space-y-2">
        {salons.map((salon) => (
          <div
            key={salon.id}
            className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className={`${fraunces.className} font-semibold text-stone-900`}>{salon.name}</p>
                <Badge variant={STATUS_VARIANT[salon.approvalStatus]}>{salon.approvalStatus}</Badge>
              </div>
              <p className="text-sm text-stone-500">
                {salon.suburb}, {salon.state} · Owner: {salon.staff[0]?.user.email ?? "—"}
              </p>
            </div>
            <SalonApprovalActions salonId={salon.id} status={salon.approvalStatus} />
          </div>
        ))}
      </div>
    </div>
  );
}
