import { describe, expect, it, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { createBooking } from "./create-booking";

// Fresh salon/barber/service per test run (cuid-suffixed) so repeat runs
// against the same local dev DB never collide with leftover rows.
const suffix = Date.now().toString(36);

let salonId: string;
let barberId: string;
let serviceId: string;
let dateStr: string;

beforeAll(async () => {
  const plan = await db.subscriptionPlan.upsert({
    where: { name: "BASIC" },
    update: {},
    create: { name: "BASIC", maxOnlineBarbers: 2 },
  });

  const salon = await db.salon.create({
    data: {
      slug: `test-salon-${suffix}`,
      name: "Test Salon",
      address: "1 Test St",
      suburb: "Testville",
      state: "QLD",
      postcode: "4000",
      lat: -27.5,
      lng: 153.0,
      timezone: "Australia/Brisbane",
      approvalStatus: "APPROVED",
    },
  });
  salonId = salon.id;
  await db.salonSubscription.create({ data: { salonId, planId: plan.id } });

  const barber = await db.barber.create({
    data: { salonId, name: "Test Barber", bookableOnline: true },
  });
  barberId = barber.id;

  const service = await db.service.create({
    data: { salonId, name: "Test Haircut", priceCents: 3000, durationMinutes: 30 },
  });
  serviceId = service.id;

  await db.barberService.create({ data: { barberId, serviceId } });

  // Open all day, every day, so the test isn't sensitive to which weekday it runs on.
  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
    await db.openingHours.create({
      data: { salonId, dayOfWeek, isClosed: false, openMin: 0, closeMin: 24 * 60 - 1 },
    });
    await db.barberWorkingHours.create({
      data: { barberId, dayOfWeek, isOff: false, startMin: 0, endMin: 24 * 60 - 1 },
    });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateStr = tomorrow.toISOString().slice(0, 10);
});

describe("createBooking + double-booking protection", () => {
  it("books a slot successfully, then rejects the identical slot via the availability pre-check", async () => {
    const startAt = new Date(`${dateStr}T10:00:00`);

    const first = await createBooking({
      salonId,
      serviceId,
      barberId,
      dateStr,
      startAt,
      guestName: "Alice",
      guestPhone: "0400000001",
    });
    expect("booking" in first).toBe(true);

    const second = await createBooking({
      salonId,
      serviceId,
      barberId,
      dateStr,
      startAt,
      guestName: "Bob",
      guestPhone: "0400000002",
    });
    expect("error" in second).toBe(true);
  });

  it("under a real concurrent race, the DB exclusion constraint lets exactly one of two overlapping inserts through", async () => {
    // Bypass the app-level pre-check (createBooking) and race two raw
    // inserts for overlapping-but-not-identical ranges directly against the
    // DB — this is what actually proves the constraint, not just the app's
    // sequential re-check.
    const startA = new Date(`${dateStr}T14:00:00`);
    const endA = new Date(`${dateStr}T14:30:00`);
    const startB = new Date(`${dateStr}T14:15:00`); // overlaps A
    const endB = new Date(`${dateStr}T14:45:00`);

    const insert = (ref: string, startAt: Date, endAt: Date) =>
      db.booking.create({
        data: {
          reference: ref,
          salonId,
          barberId,
          serviceId,
          guestName: "Racer",
          guestPhone: "0400000003",
          startAt,
          endAt,
          serviceNameSnapshot: "Test Haircut",
          priceCentsSnapshot: 3000,
          durationMinutesSnapshot: 30,
          status: "CONFIRMED",
          source: "ONLINE",
        },
      });

    const results = await Promise.allSettled([
      insert(`BM-RACEA${suffix.slice(-4)}`, startA, endA),
      insert(`BM-RACEB${suffix.slice(-4)}`, startB, endB),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  });
});
