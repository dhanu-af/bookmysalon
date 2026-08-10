// Pure, DB-free availability math — kept separate from availability.ts (which
// does the Prisma fetching) so the actual slot-generation logic gets fast
// unit tests instead of only being exercised through a real database.

export const SLOT_GRANULARITY_MIN = 15;

export interface BusyInterval {
  start: number; // minutes from midnight, local to the salon's timezone
  end: number;
}

/**
 * Candidate start times (minutes from midnight) for a service of the given
 * duration inside [windowStart, windowEnd), skipping anything that overlaps
 * a busy interval (breaks, existing bookings, blocked time) and anything
 * that has already passed `nowMinutes` (only meaningful when generating
 * slots for "today" — pass undefined for any future date).
 */
export function computeSlotsForWindow(params: {
  windowStart: number;
  windowEnd: number;
  durationMinutes: number;
  busy: BusyInterval[];
  granularity?: number;
  nowMinutes?: number;
}): number[] {
  const granularity = params.granularity ?? SLOT_GRANULARITY_MIN;
  const slots: number[] = [];

  for (
    let slotStart = params.windowStart;
    slotStart + params.durationMinutes <= params.windowEnd;
    slotStart += granularity
  ) {
    const slotEnd = slotStart + params.durationMinutes;

    if (params.nowMinutes != null && slotStart < params.nowMinutes) continue;

    const overlaps = params.busy.some((b) => slotStart < b.end && slotEnd > b.start);
    if (overlaps) continue;

    slots.push(slotStart);
  }

  return slots;
}

export function minutesToHHmm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Minutes-from-midnight of `date`, read in `timeZone` (DST-correct, no external tz lib needed). */
export function minutesFromMidnightInZone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")!.value);
  const minute = Number(parts.find((p) => p.type === "minute")!.value);
  return hour * 60 + minute;
}
