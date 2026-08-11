"use server";

import { revalidatePath } from "next/cache";
import { requireSalonStaff } from "@/lib/session";
import { db } from "@/lib/db";
import type { SalonRunningStatus } from "@/generated/prisma/client";

export async function setSalonRunningStatus(salonId: string, status: SalonRunningStatus) {
  await requireSalonStaff(salonId);
  await db.salon.update({ where: { id: salonId }, data: { runningStatus: status } });
  revalidatePath(`/dashboard/${salonId}`);
  revalidatePath(`/salons`);
  return { success: true };
}
