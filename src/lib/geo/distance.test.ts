import { describe, expect, it } from "vitest";
import { haversineKm } from "./distance";

describe("haversineKm", () => {
  it("returns 0 for identical points", () => {
    expect(haversineKm(-27.4698, 153.0251, -27.4698, 153.0251)).toBe(0);
  });

  it("returns roughly the known Brisbane-to-Sydney CBD distance (~730km)", () => {
    const km = haversineKm(-27.4698, 153.0251, -33.8688, 151.2093);
    expect(km).toBeGreaterThan(700);
    expect(km).toBeLessThan(760);
  });
});
