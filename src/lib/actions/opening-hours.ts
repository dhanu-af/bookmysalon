"use server";

import { revalidatePath } from "next/cache";
import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";

export async function setOpeningHours(
  salonId: string,
  hours: { dayOfWeek: number; isClosed: boolean; openMin: number | null; closeMin: number | null }[]
) {
  await requireSalonOwner(salonId);
  await db.$transaction(
    hours.map((h) =>
      db.openingHours.upsert({
        where: { salonId_dayOfWeek: { salonId, dayOfWeek: h.dayOfWeek } },
        update: { isClosed: h.isClosed, openMin: h.openMin, closeMin: h.closeMin },
        create: { salonId, dayOfWeek: h.dayOfWeek, isClosed: h.isClosed, openMin: h.openMin, closeMin: h.closeMin },
      })
    )
  );
  revalidatePath(`/dashboard/${salonId}/hours`);
  return { success: true };
}
