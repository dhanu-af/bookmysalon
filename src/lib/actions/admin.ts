"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import type { SalonApprovalStatus } from "@/generated/prisma/client";

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
