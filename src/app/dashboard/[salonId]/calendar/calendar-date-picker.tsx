"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function CalendarDatePicker({ dateStr }: { dateStr: string }) {
  const router = useRouter();
  return (
    <Input
      type="date"
      value={dateStr}
      onChange={(e) => router.push(`?date=${e.target.value}`)}
      className="w-40"
    />
  );
}
