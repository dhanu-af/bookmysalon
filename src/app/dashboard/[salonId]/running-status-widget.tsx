"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { setSalonRunningStatus } from "@/lib/actions/salon-status";
import { RUNNING_STATUS_LABELS } from "@/lib/salon-status";
import type { SalonRunningStatus } from "@/generated/prisma/client";

const OPTIONS: SalonRunningStatus[] = ["ON_TIME", "DELAYED_10", "DELAYED_30"];

export function RunningStatusWidget({ salonId, current }: { salonId: string; current: SalonRunningStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setStatus(status: SalonRunningStatus) {
    startTransition(async () => {
      await setSalonRunningStatus(salonId, status);
      toast.success("Status updated");
      router.refresh();
    });
  }

  return (
    <Card className="mb-6">
      <CardContent className="flex flex-wrap items-center gap-2 p-4">
        <span className="mr-2 text-sm font-medium text-muted-foreground">Running status:</span>
        {OPTIONS.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={current === status ? "default" : "outline"}
            disabled={pending}
            onClick={() => setStatus(status)}
          >
            {RUNNING_STATUS_LABELS[status]}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
