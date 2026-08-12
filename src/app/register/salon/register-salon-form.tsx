"use client";

import { useState } from "react";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSalon } from "@/lib/actions/auth";

export function RegisterSalonForm() {
  const [submitted, setSubmitted] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [password, setPassword] = useState("");
  const [salonName, setSalonName] = useState("");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function useMyLocation() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error("Couldn't get your location")
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // No coords? The server falls back to geocoding the typed address —
    // only errors out if that's also unavailable (no API key configured yet).
    setSubmitting(true);
    const result = await registerSalon({
      ownerName,
      ownerEmail,
      ownerPhone,
      password,
      salonName,
      address,
      suburb,
      state,
      postcode,
      lat: coords?.lat,
      lng: coords?.lng,
    });
    if ("error" in result) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground">
        Salon submitted for approval — both your account and your salon listing are pending review. You&apos;ll be able to sign in and
        set up your dashboard once an admin approves your account.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" value={ownerName} onChange={setOwnerName} />
        <Field label="Your email" type="email" value={ownerEmail} onChange={setOwnerEmail} />
        <Field label="Your mobile" type="tel" value={ownerPhone} onChange={setOwnerPhone} />
        <Field label="Password" type="password" value={password} onChange={setPassword} minLength={8} />
      </div>
      <Field label="Salon name" value={salonName} onChange={setSalonName} />
      <Field label="Address" value={address} onChange={setAddress} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Suburb" value={suburb} onChange={setSuburb} />
        <Field label="State" value={state} onChange={setState} />
        <Field label="Postcode" value={postcode} onChange={setPostcode} />
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={useMyLocation} className="gap-2">
          <LocateFixed className="size-4" />
          {coords ? "Location set" : "Use my current location (optional)"}
        </Button>
        {coords && <span className="text-xs text-muted-foreground">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>}
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit for approval"}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  minLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} required minLength={minLength} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
