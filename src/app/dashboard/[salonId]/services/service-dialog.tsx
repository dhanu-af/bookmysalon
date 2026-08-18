"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createService, updateService } from "@/lib/actions/services";
import { fraunces } from "@/lib/fonts";

const primaryButtonClassName =
  "rounded-xl bg-[#7C2D3E] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";
const outlineButtonSmClassName =
  "rounded-lg border-2 border-stone-300 px-3 py-1 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900";

type Existing = { id: string; name: string; priceCents: number; durationMinutes: number; active: boolean };

export function ServiceDialog({ salonId, existing }: { salonId: string; existing?: Existing }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existing?.name ?? "");
  const [price, setPrice] = useState(existing ? String(existing.priceCents / 100) : "");
  const [duration, setDuration] = useState(existing ? String(existing.durationMinutes) : "30");
  const [active, setActive] = useState(existing?.active ?? true);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setSubmitting(true);
    const input = { name, priceCents: Math.round(Number(price) * 100), durationMinutes: Number(duration), active };
    const result = existing ? await updateService(existing.id, salonId, input) : await createService(salonId, input);
    setSubmitting(false);
    if ("error" in result) {
      toast.error(result.error as string);
      return;
    }
    toast.success("Saved");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className={existing ? outlineButtonSmClassName : primaryButtonClassName}>{existing ? "Edit" : "Add Service"}</button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={fraunces.className}>{existing ? "Edit Service" : "Add Service"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Haircut" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Price ($)</Label>
              <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" min="5" step="5" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          {existing && (
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3">
              <p className="text-sm font-medium text-stone-900">Active</p>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          )}
        </div>
        <DialogFooter>
          <button className={primaryButtonClassName} disabled={!name || !price || submitting} onClick={onSubmit}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
