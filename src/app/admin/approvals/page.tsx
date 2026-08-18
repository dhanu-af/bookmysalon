import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { UserApprovalActions } from "./user-approval-actions";
import { SalonApprovalActions } from "../salons/salon-approval-actions";
import { fraunces } from "@/lib/fonts";

export default async function AdminApprovalsPage() {
  const [pendingUsers, pendingSalons] = await Promise.all([
    db.user.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { staffMemberships: { where: { role: "OWNER" }, include: { salon: true } } },
    }),
    db.salon.findMany({
      where: { approvalStatus: "PENDING_APPROVAL" },
      orderBy: { createdAt: "asc" },
      include: { staff: { where: { role: "OWNER" }, include: { user: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className={`${fraunces.className} mb-1 text-2xl font-semibold text-stone-900`}>Approvals</h1>
        <p className="text-sm text-stone-500">New accounts and salon listings waiting on your review.</p>
      </div>

      <section>
        <h2 className={`${fraunces.className} mb-3 text-lg font-semibold text-stone-900`}>Pending accounts ({pendingUsers.length})</h2>
        {pendingUsers.length === 0 && <p className="text-sm text-stone-500">Nothing waiting on you here.</p>}
        <div className="space-y-2">
          {pendingUsers.map((u) => {
            const ownedSalon = u.staffMemberships[0]?.salon;
            return (
              <div
                key={u.id}
                className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-900">{u.name ?? u.email}</p>
                    <Badge variant="secondary">{ownedSalon ? "Salon owner" : "Customer"}</Badge>
                  </div>
                  <p className="text-sm text-stone-500">
                    {u.email}
                    {u.phone && ` · ${u.phone}`}
                    {ownedSalon && ` · Salon: ${ownedSalon.name}`}
                  </p>
                </div>
                <UserApprovalActions userId={u.id} />
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className={`${fraunces.className} mb-3 text-lg font-semibold text-stone-900`}>
          Pending salon listings ({pendingSalons.length})
        </h2>
        {pendingSalons.length === 0 && <p className="text-sm text-stone-500">Nothing waiting on you here.</p>}
        <div className="space-y-2">
          {pendingSalons.map((salon) => (
            <div
              key={salon.id}
              className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-stone-900">{salon.name}</p>
                <p className="text-sm text-stone-500">
                  {salon.suburb}, {salon.state} · Owner: {salon.staff[0]?.user.email ?? "—"}
                </p>
              </div>
              <SalonApprovalActions salonId={salon.id} status={salon.approvalStatus} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
