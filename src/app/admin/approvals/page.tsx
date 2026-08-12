import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserApprovalActions } from "./user-approval-actions";
import { SalonApprovalActions } from "../salons/salon-approval-actions";

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
        <h1 className="mb-1 text-2xl font-bold">Approvals</h1>
        <p className="text-sm text-muted-foreground">New accounts and salon listings waiting on your review.</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Pending accounts ({pendingUsers.length})</h2>
        {pendingUsers.length === 0 && <p className="text-sm text-muted-foreground">Nothing waiting on you here.</p>}
        <div className="space-y-2">
          {pendingUsers.map((u) => {
            const ownedSalon = u.staffMemberships[0]?.salon;
            return (
              <Card key={u.id}>
                <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{u.name ?? u.email}</p>
                      <Badge variant="secondary">{ownedSalon ? "Salon owner" : "Customer"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {u.email}
                      {u.phone && ` · ${u.phone}`}
                      {ownedSalon && ` · Salon: ${ownedSalon.name}`}
                    </p>
                  </div>
                  <UserApprovalActions userId={u.id} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Pending salon listings ({pendingSalons.length})</h2>
        {pendingSalons.length === 0 && <p className="text-sm text-muted-foreground">Nothing waiting on you here.</p>}
        <div className="space-y-2">
          {pendingSalons.map((salon) => (
            <Card key={salon.id}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{salon.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {salon.suburb}, {salon.state} · Owner: {salon.staff[0]?.user.email ?? "—"}
                  </p>
                </div>
                <SalonApprovalActions salonId={salon.id} status={salon.approvalStatus} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
