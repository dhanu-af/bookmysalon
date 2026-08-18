"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { setOpeningHours } from "@/lib/actions/opening-hours";
import { minutesToHHmm } from "@/lib/booking/slots";

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Hour = { dayOfWeek: number; isClosed: boolean; openMin: number | null; closeMin: number | null };

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function HoursEditor({ salonId, initialHours }: { salonId: string; initialHours: Hour[] }) {
  const router = useRouter();
  const [hours, setHours] = useState<Hour[]>(
    Array.from({ length: 7 }, (_, d) => initialHours.find((h) => h.dayOfWeek === d) ?? { dayOfWeek: d, isClosed: true, openMin: null, closeMin: null })
  );
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setSaving(true);
    await setOpeningHours(salonId, hours);
    setSaving(false);
    toast.success("Opening hours saved");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {hours.map((h, i) => (
        <div key={h.dayOfWeek} className="rounded-2xl border border-stone-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 p-3">
            <span className="w-24 text-sm font-medium text-stone-900">{WEEKDAY_LABELS[h.dayOfWeek]}</span>
            <label className="flex items-center gap-1.5 text-sm">
              <Checkbox
                checked={!h.isClosed}
                onCheckedChange={(checked) => {
                  const next = [...hours];
                  next[i] = { ...h, isClosed: !checked, openMin: checked ? 540 : null, closeMin: checked ? 1080 : null };
                  setHours(next);
                }}
              />
              Open
            </label>
            {!h.isClosed && (
              <>
                <Input
                  type="time"
                  className="w-28"
                  value={h.openMin != null ? minutesToHHmm(h.openMin) : ""}
                  onChange={(e) => {
                    const next = [...hours];
                    next[i] = { ...h, openMin: hhmmToMinutes(e.target.value) };
                    setHours(next);
                  }}
                />
                <span className="text-sm text-stone-500">to</span>
                <Input
                  type="time"
                  className="w-28"
                  value={h.closeMin != null ? minutesToHHmm(h.closeMin) : ""}
                  onChange={(e) => {
                    const next = [...hours];
                    next[i] = { ...h, closeMin: hhmmToMinutes(e.target.value) };
                    setHours(next);
                  }}
                />
              </>
            )}
          </div>
        </div>
      ))}
      <button
        className="rounded-xl bg-[#7C2D3E] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        disabled={saving}
        onClick={onSave}
      >
        {saving ? "Saving..." : "Save Opening Hours"}
      </button>
    </div>
  );
}
