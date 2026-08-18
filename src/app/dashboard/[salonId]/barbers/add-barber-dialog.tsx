"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createBarber } from "@/lib/actions/barbers";
import { fraunces } from "@/lib/fonts";

const primaryButtonClassName =
  "rounded-xl bg-[#7C2D3E] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export function AddBarberDialog({ salonId, atLimit }: { salonId: string; atLimit: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bookableOnline, setBookableOnline] = useState(!atLimit);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setSubmitting(true);
    const result = await createBarber(salonId, { name, title: title || undefined, bookableOnline });
    setSubmitting(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Barber added");
    setOpen(false);
    setName("");
    setTitle("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className={primaryButtonClassName}>Add Barber</button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={fraunces.className}>Add Barber</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Barber" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Online booking</p>
              {atLimit && !bookableOnline && (
                <p className="text-xs text-muted-foreground">Online slots are full — this barber will be walk-in only.</p>
              )}
            </div>
            <Switch checked={bookableOnline} onCheckedChange={setBookableOnline} disabled={atLimit} />
          </div>
        </div>
        <DialogFooter>
          <button className={primaryButtonClassName} disabled={!name || submitting} onClick={onSubmit}>
            {submitting ? "Adding..." : "Add Barber"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
