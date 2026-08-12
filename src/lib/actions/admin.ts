"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import type { SalonApprovalStatus, UserApprovalStatus } from "@/generated/prisma/client";

async function setSalonApprovalStatus(salonId: string, status: SalonApprovalStatus, actorId: string) {
  await db.$transaction([
    db.salon.update({ where: { id: salonId }, data: { approvalStatus: status } }),
    db.auditLog.create({
      data: { actorId, action: `salon.${status.toLowerCase()}`, entityType: "Salon", entityId: salonId },
    }),
  ]);
  revalidatePath("/admin/salons");
}

export async function approveSalon(salonId: string) {
  const { user } = await requireSuperAdmin();
  await setSalonApprovalStatus(salonId, "APPROVED", user.id);
  return { success: true };
}

export async function rejectSalon(salonId: string) {
  const { user } = await requireSuperAdmin();
  await setSalonApprovalStatus(salonId, "REJECTED", user.id);
  return { success: true };
}

export async function suspendSalon(salonId: string) {
  const { user } = await requireSuperAdmin();
  await setSalonApprovalStatus(salonId, "SUSPENDED", user.id);
  return { success: true };
}

async function setUserApprovalStatus(userId: string, status: UserApprovalStatus, actorId: string) {
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { approvalStatus: status } }),
    db.auditLog.create({
      data: { actorId, action: `user.${status.toLowerCase()}`, entityType: "User", entityId: userId },
    }),
  ]);
  revalidatePath("/admin/approvals");
}

export async function approveUser(userId: string) {
  const { user } = await requireSuperAdmin();
  await setUserApprovalStatus(userId, "APPROVED", user.id);
  return { success: true };
}

export async function rejectUser(userId: string) {
  const { user } = await requireSuperAdmin();
  await setUserApprovalStatus(userId, "REJECTED", user.id);
  return { success: true };
}

const createSuperAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/** Lets an existing super admin create another one — the only way to add one, since there's no public "become an admin" flow. */
export async function createSuperAdmin(input: z.infer<typeof createSuperAdminSchema>) {
  const { user: actor } = await requireSuperAdmin();
  const parsed = createSuperAdminSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "An account with this email already exists" };

  const passwordHash = await hashPassword(parsed.data.password);
  await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash, isSuperAdmin: true, approvalStatus: "APPROVED" },
    });
    await tx.auditLog.create({
      data: { actorId: actor.id, action: "user.super_admin_created", entityType: "User", entityId: created.id },
    });
  });
  revalidatePath("/admin/admins");
  return { success: true };
}
