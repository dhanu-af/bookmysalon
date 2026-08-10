"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card key={h.dayOfWeek}>
          <CardContent className="flex flex-wrap items-center gap-3 p-3">
            <span className="w-24 text-sm font-medium">{WEEKDAY_LABELS[h.dayOfWeek]}</span>
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
                <span className="text-sm text-muted-foreground">to</span>
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
          </CardContent>
        </Card>
      ))}
      <Button disabled={saving} onClick={onSave}>
        {saving ? "Saving..." : "Save Opening Hours"}
      </Button>
    </div>
  );
}
