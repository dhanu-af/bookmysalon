"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveSalon, rejectSalon, suspendSalon } from "@/lib/actions/admin";
import type { SalonApprovalStatus } from "@/generated/prisma/client";

export function SalonApprovalActions({ salonId, status }: { salonId: string; status: SalonApprovalStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<unknown>, label: string) {
    startTransition(async () => {
      await action(salonId);
      toast.success(label);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {status !== "APPROVED" && (
        <Button size="sm" disabled={pending} onClick={() => run(approveSalon, "Salon approved")}>
          Approve
        </Button>
      )}
      {status !== "REJECTED" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(rejectSalon, "Salon rejected")}>
          Reject
        </Button>
      )}
      {status === "APPROVED" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(suspendSalon, "Salon suspended")}>
          Suspend
        </Button>
      )}
    </div>
  );
}
