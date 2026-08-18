"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteBlockedTime } from "@/lib/actions/blocked-times";

export function DeleteBlockedTimeButton({ blockedTimeId, salonId }: { blockedTimeId: string; salonId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="rounded-lg border-2 border-stone-300 px-3 py-1 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-50"
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
    </button>
  );
}
