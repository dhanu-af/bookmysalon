"use server";

import { revalidatePath } from "next/cache";
import { requireSalonStaff } from "@/lib/session";
import { db } from "@/lib/db";

export async function createBlockedTime(
  salonId: string,
  input: { barberId?: string; startAt: Date; endAt: Date; reason: string }
) {
  await requireSalonStaff(salonId);
  if (input.endAt <= input.startAt) return { error: "End time must be after start time" };

  await db.blockedTime.create({
    data: { salonId, barberId: input.barberId, startAt: input.startAt, endAt: input.endAt, reason: input.reason },
  });
  revalidatePath(`/dashboard/${salonId}/blocked-times`);
  return { success: true };
}

export async function deleteBlockedTime(blockedTimeId: string, salonId: string) {
  await requireSalonStaff(salonId);
  await db.blockedTime.delete({ where: { id: blockedTimeId } });
  revalidatePath(`/dashboard/${salonId}/blocked-times`);
  return { success: true };
}
