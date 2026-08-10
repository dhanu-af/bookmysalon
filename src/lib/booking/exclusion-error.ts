import { Prisma } from "@/generated/prisma/client";

// Postgres exclusion_violation — raised by the booking_no_overlap constraint
// (see prisma/migrations/.../migration.sql) when two requests race for the
// same barber/time.
const EXCLUSION_VIOLATION = "23P01";

export function isExclusionViolation(e: unknown): boolean {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError)) return false;
  const driverError = e.meta?.driverAdapterError;
  if (!driverError || typeof driverError !== "object" || !("cause" in driverError)) return false;
  const cause = driverError.cause;
  return !!cause && typeof cause === "object" && (cause as { code?: string }).code === EXCLUSION_VIOLATION;
}
