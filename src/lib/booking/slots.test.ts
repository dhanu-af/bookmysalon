import { describe, expect, it } from "vitest";
import { computeSlotsForWindow, minutesToHHmm } from "./slots";

describe("computeSlotsForWindow", () => {
  it("returns every granularity-aligned slot when nothing is busy", () => {
    // 9:00-10:00 window (540-600), 30 min service, 15 min granularity -> 9:00, 9:15, 9:30 (9:45+30=10:15 > 600, excluded)
    const slots = computeSlotsForWindow({ windowStart: 540, windowEnd: 600, durationMinutes: 30, busy: [] });
    expect(slots.map(minutesToHHmm)).toEqual(["09:00", "09:15", "09:30"]);
  });

  it("matches the spec's worked example: John 9-5, 30min haircut, bookings at 10-10:30, 11:30-12, 2-2:45", () => {
    const busy = [
      { start: 10 * 60, end: 10 * 60 + 30 },
      { start: 11 * 60 + 30, end: 12 * 60 },
      { start: 14 * 60, end: 14 * 60 + 45 },
    ];
    const slots = computeSlotsForWindow({
      windowStart: 9 * 60,
      windowEnd: 17 * 60,
      durationMinutes: 30,
      busy,
    });

    // Never offers a slot that overlaps a busy interval.
    expect(slots).not.toContain(10 * 60);
    expect(slots).not.toContain(9 * 60 + 45); // 9:45-10:15 overlaps 10:00-10:30
    expect(slots).not.toContain(14 * 60 + 30); // 14:30-15:00 overlaps 14:00-14:45

    // Adjacent (touching, non-overlapping) slots ARE offered.
    expect(slots).toContain(9 * 60 + 30); // 9:30-10:00, ends exactly when the 10:00 booking starts
    expect(slots).toContain(10 * 60 + 30); // 10:30-11:00, starts exactly when the 10:00 booking ends
    expect(slots).toContain(14 * 60 + 45); // 14:45-15:15, right after the 14:00-14:45 booking
  });

  it("excludes slots before nowMinutes (today only)", () => {
    const slots = computeSlotsForWindow({ windowStart: 540, windowEnd: 600, durationMinutes: 15, busy: [], nowMinutes: 570 });
    expect(Math.min(...slots)).toBeGreaterThanOrEqual(570);
  });

  it("never offers a slot that would run past the window", () => {
    const slots = computeSlotsForWindow({ windowStart: 540, windowEnd: 570, durationMinutes: 30, busy: [] });
    expect(slots).toEqual([540]); // only 9:00-9:30 fits in a 9:00-9:30 window
  });

  it("returns nothing when the window is smaller than the service duration", () => {
    const slots = computeSlotsForWindow({ windowStart: 540, windowEnd: 560, durationMinutes: 30, busy: [] });
    expect(slots).toEqual([]);
  });
});
