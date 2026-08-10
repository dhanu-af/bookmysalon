import { redirect, notFound } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

/** Platform-wide super admin only (User.isSuperAdmin). 404s otherwise (never leaks page existence). */
export async function requireSuperAdmin() {
  const user = await requireUser();
  if (!user.isSuperAdmin) notFound();
  return { user };
}

/** Any staff role (OWNER or BARBER) at this salon. 404s if the user has no membership there. */
export async function requireSalonStaff(salonId: string) {
  const user = await requireUser();
  const staff = await db.salonStaff.findUnique({
    where: { userId_salonId: { userId: user.id, salonId } },
  });
  if (!staff) notFound();
  return { user, staff };
}

/** OWNER role at this salon specifically — barbers can't manage services/hours/other-barbers. */
export async function requireSalonOwner(salonId: string) {
  const { user, staff } = await requireSalonStaff(salonId);
  if (staff.role !== "OWNER") notFound();
  return { user, staff };
}

/**
 * Scopes a booking query to what this staff member is allowed to see:
 * owners see the whole salon, barbers see only their own bookings.
 */
export function bookingScopeForStaff(staff: { role: "OWNER" | "BARBER"; barberId: string | null }) {
  return staff.role === "OWNER" ? {} : { barberId: staff.barberId ?? "__none__" };
}
