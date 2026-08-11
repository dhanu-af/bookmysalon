import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedDemoData } from "@/lib/seed-data";

/**
 * One-time production seeding, reachable without a local connection string
 * to whichever database the deployment is actually running against — reuses
 * the already-configured AUTH_SECRET as the bearer token rather than
 * requiring yet another manually-added env var. Safe to call more than
 * once: seedDemoData is idempotent (upsert / find-or-create throughout).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!process.env.AUTH_SECRET || secret !== process.env.AUTH_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const log = await seedDemoData(db);
  return NextResponse.json({ log });
}
