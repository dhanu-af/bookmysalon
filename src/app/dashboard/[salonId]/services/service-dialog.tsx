"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createService, updateService } from "@/lib/actions/services";

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
          <Button variant={existing ? "outline" : "default"} size={existing ? "sm" : "default"}>
            {existing ? "Edit" : "Add Service"}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Edit Service" : "Add Service"}</DialogTitle>
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
            <div className="flex items-center justify-between rounded-lg border p-3">
              <p className="text-sm font-medium">Active</p>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button disabled={!name || !price || submitting} onClick={onSubmit}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
