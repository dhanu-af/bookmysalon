"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveUser, rejectUser } from "@/lib/actions/admin";

export function UserApprovalActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<unknown>, label: string) {
    startTransition(async () => {
      await action(userId);
      toast.success(label);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => run(approveUser, "Account approved")}>
        Approve
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run(rejectUser, "Account rejected")}>
        Reject
      </Button>
    </div>
  );
}
