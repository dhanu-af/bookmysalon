"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSalonProfile } from "@/lib/actions/salon-profile";

const primaryButtonClassName =
  "rounded-xl bg-[#7C2D3E] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export function ProfileEditor({
  salon,
}: {
  salon: { id: string; name: string; description: string | null; phone: string | null; address: string; suburb: string; state: string; postcode: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(salon.name);
  const [description, setDescription] = useState(salon.description ?? "");
  const [phone, setPhone] = useState(salon.phone ?? "");
  const [address, setAddress] = useState(salon.address);
  const [suburb, setSuburb] = useState(salon.suburb);
  const [state, setState] = useState(salon.state);
  const [postcode, setPostcode] = useState(salon.postcode);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setSubmitting(true);
    await updateSalonProfile(salon.id, { name, description: description || undefined, phone: phone || undefined, address, suburb, state, postcode });
    setSubmitting(false);
    toast.success("Saved");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Salon name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Phone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Suburb</Label>
          <Input value={suburb} onChange={(e) => setSuburb(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>State</Label>
          <Input value={state} onChange={(e) => setState(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Postcode</Label>
          <Input value={postcode} onChange={(e) => setPostcode(e.target.value)} />
        </div>
      </div>
      <button className={primaryButtonClassName} disabled={submitting} onClick={onSubmit}>
        {submitting ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
