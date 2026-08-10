"use server";

import { revalidatePath } from "next/cache";
import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";

export async function createService(
  salonId: string,
  input: { name: string; description?: string; priceCents: number; durationMinutes: number }
) {
  await requireSalonOwner(salonId);
  await db.service.create({ data: { salonId, ...input } });
  revalidatePath(`/dashboard/${salonId}/services`);
  return { success: true };
}

export async function updateService(
  serviceId: string,
  salonId: string,
  input: { name: string; description?: string; priceCents: number; durationMinutes: number; active: boolean }
) {
  await requireSalonOwner(salonId);
  await db.service.update({ where: { id: serviceId }, data: input });
  revalidatePath(`/dashboard/${salonId}/services`);
  return { success: true };
}
