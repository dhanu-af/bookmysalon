import { db } from "@/lib/db";

/** e.g. "BM-48291" — shown to guests to look up/manage a booking without an account. */
export async function generateUniqueReference(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `BM-${Math.floor(10000 + Math.random() * 90000)}`;
    const existing = await db.booking.findUnique({ where: { reference: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique booking reference");
}
