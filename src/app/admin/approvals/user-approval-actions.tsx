"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
      <button
        type="button"
        disabled={pending}
        onClick={() => run(approveUser, "Account approved")}
        className="rounded-lg bg-[#7C2D3E] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#6B2535] disabled:pointer-events-none disabled:opacity-50"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(rejectUser, "Account rejected")}
        className="rounded-lg border-2 border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
