"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
        <button
          type="button"
          disabled={pending}
          onClick={() => run(approveSalon, "Salon approved")}
          className="rounded-lg bg-[#7C2D3E] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#6B2535] disabled:pointer-events-none disabled:opacity-50"
        >
          Approve
        </button>
      )}
      {status !== "REJECTED" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(rejectSalon, "Salon rejected")}
          className="rounded-lg border-2 border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-50"
        >
          Reject
        </button>
      )}
      {status === "APPROVED" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(suspendSalon, "Salon suspended")}
          className="rounded-lg border-2 border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-50"
        >
          Suspend
        </button>
      )}
    </div>
  );
}
