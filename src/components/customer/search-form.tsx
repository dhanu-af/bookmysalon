"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { localDateStr } from "@/lib/date";

function addDaysStr(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localDateStr(d);
}

export function SearchForm() {
  const router = useRouter();
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [when, setWhen] = useState("today");
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
    if (coords) {
      params.set("lat", String(coords.lat));
      params.set("lng", String(coords.lng));
    }
    const date = when === "tomorrow" ? addDaysStr(1) : when === "weekend" ? nextSaturdayStr() : localDateStr(new Date());
    params.set("date", date);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-[1.5fr_1.5fr_1fr_auto] sm:items-end">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">What are you looking for?</label>
        <Input placeholder="Haircut, Beard Trim, Hair Colour..." value={service} onChange={(e) => setService(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Where?</label>
        <div className="flex gap-1.5">
          <Input placeholder="Suburb or postcode" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Button type="button" variant="outline" size="icon" onClick={useMyLocation} title="Use my location">
            <LocateFixed className={locating ? "size-4 animate-pulse" : "size-4"} />
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">When?</label>
        <Select value={when} onValueChange={(v) => v && setWhen(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="weekend">This weekend</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="lg" className="gap-2">
        <Search className="size-4" />
        Find Available Appointments
      </Button>
    </form>
  );
}

function nextSaturdayStr() {
  const d = new Date();
  const day = d.getDay();
  const diff = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return localDateStr(d);
}
