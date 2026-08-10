import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SalonApprovalActions } from "./salon-approval-actions";

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
      <h1 className="mb-6 text-2xl font-bold">Salons</h1>
      <div className="space-y-2">
        {salons.map((salon) => (
          <Card key={salon.id}>
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{salon.name}</p>
                  <Badge variant={STATUS_VARIANT[salon.approvalStatus]}>{salon.approvalStatus}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {salon.suburb}, {salon.state} · Owner: {salon.staff[0]?.user.email ?? "—"}
                </p>
              </div>
              <SalonApprovalActions salonId={salon.id} status={salon.approvalStatus} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
