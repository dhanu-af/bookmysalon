"use server";

import { revalidatePath } from "next/cache";
import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";

export async function updateSalonProfile(
  salonId: string,
  input: { name: string; description?: string; phone?: string; address: string; suburb: string; state: string; postcode: string }
) {
  await requireSalonOwner(salonId);
  await db.salon.update({ where: { id: salonId }, data: input });
  revalidatePath(`/dashboard/${salonId}/profile`);
  revalidatePath(`/salons`);
  return { success: true };
}
