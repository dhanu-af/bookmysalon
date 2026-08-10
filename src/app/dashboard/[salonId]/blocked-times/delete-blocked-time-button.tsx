"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteBlockedTime } from "@/lib/actions/blocked-times";

export function DeleteBlockedTimeButton({ blockedTimeId, salonId }: { blockedTimeId: string; salonId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await deleteBlockedTime(blockedTimeId, salonId);
          toast.success("Removed");
          router.refresh();
        })
      }
    >
      Remove
    </Button>
  );
}
