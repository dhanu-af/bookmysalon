"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
      <span className="mr-2 text-sm font-medium text-stone-500">Running status:</span>
      {OPTIONS.map((status) => {
        const active = current === status;
        return (
          <button
            key={status}
            type="button"
            disabled={pending}
            onClick={() => setStatus(status)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 ${
              active
                ? "bg-[#7C2D3E] text-white shadow-sm"
                : "border-2 border-stone-300 text-stone-700 hover:border-stone-400 hover:text-stone-900"
            }`}
          >
            {RUNNING_STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
}
