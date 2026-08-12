"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { localDateStr } from "@/lib/date";

const WHEN_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "This weekend" },
] as const;

function addDaysStr(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localDateStr(d);
}

function nextSaturdayStr() {
  const d = new Date();
  const day = d.getDay();
  const diff = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return localDateStr(d);
}

function FieldButton({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 text-left transition-all duration-150 hover:border-stone-300 hover:bg-stone-100/60">
      <span className="shrink-0 text-xl">{icon}</span>
      <div className="min-w-0 flex-1 text-left">
        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">{label}</p>
        <p className="truncate text-sm font-semibold text-stone-900">{value}</p>
      </div>
      <span className="text-xs text-stone-400">▾</span>
    </div>
  );
}

export function HeroSearch() {
  const router = useRouter();
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [when, setWhen] = useState<(typeof WHEN_OPTIONS)[number]["value"]>("today");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocation("Near me");
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set("q", service);
    if (!coords && location) params.set("q", location);
    if (coords) {
      params.set("lat", String(coords.lat));
      params.set("lng", String(coords.lng));
    }
    const date = when === "tomorrow" ? addDaysStr(1) : when === "weekend" ? nextSaturdayStr() : localDateStr(new Date());
    params.set("date", date);
    router.push(`/search?${params.toString()}`);
  }

  const whenLabel = WHEN_OPTIONS.find((o) => o.value === when)!.label;

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-stone-100 bg-white p-5 shadow-2xl shadow-stone-300/40 sm:p-6"
    >
      <p className="mb-4 font-display text-lg font-semibold text-stone-900">What are you looking for?</p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        <Popover>
          <PopoverTrigger className="w-full text-left">
            <FieldButton icon="💈" label="Service" value={service || "Haircut"} />
          </PopoverTrigger>
          <PopoverContent align="start">
            <Input
              autoFocus
              placeholder="Haircut, Beard Trim, Hair Colour..."
              value={service}
              onChange={(e) => setService(e.target.value)}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger className="w-full text-left">
            <FieldButton icon="📍" label="Location" value={location || "Near me"} />
          </PopoverTrigger>
          <PopoverContent align="start">
            <div className="flex gap-1.5">
              <Input
                autoFocus
                placeholder="Suburb or postcode"
                value={location}
                onChange={(e) => {
                  setCoords(null);
                  setLocation(e.target.value);
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={useMyLocation} title="Use my location">
                {locating ? "…" : "📍"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger className="w-full text-left">
            <FieldButton icon="📅" label="Date" value={whenLabel} />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48">
            {WHEN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setWhen(opt.value)}
                className="rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                {opt.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-[#7C2D3E] px-8 py-4 text-base font-bold tracking-wide text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] hover:shadow-lg hover:shadow-[#7C2D3E]/30 active:scale-[0.98]"
      >
        Find Available Times →
      </button>
    </form>
  );
}
