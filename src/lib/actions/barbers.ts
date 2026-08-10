"use server";

import { revalidatePath } from "next/cache";
import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { isExclusionViolation } from "@/lib/booking/exclusion-error";

const DEFAULT_MAX_ONLINE_BARBERS = 2;

async function getOnlineBarberLimit(salonId: string): Promise<number> {
  const subscription = await db.salonSubscription.findUnique({
    where: { salonId },
    include: { plan: true },
  });
  return subscription?.plan.maxOnlineBarbers ?? DEFAULT_MAX_ONLINE_BARBERS;
}

/**
 * Friendly app-level pre-check before create/update. The real, race-proof
 * guarantee is the `enforce_online_barber_limit` DB trigger (migration SQL)
 * — this only exists to turn that trigger's raw Postgres error into a
 * message a salon owner can actually understand.
 */
export async function createBarber(
  salonId: string,
  input: { name: string; title?: string; bio?: string; bookableOnline: boolean }
) {
  const { staff } = await requireSalonOwner(salonId);
  void staff;

  if (input.bookableOnline) {
    const [limit, currentOnlineCount] = await Promise.all([
      getOnlineBarberLimit(salonId),
      db.barber.count({ where: { salonId, bookableOnline: true } }),
    ]);
    if (currentOnlineCount >= limit) {
      return {
        error: `Your plan allows a maximum of ${limit} online-bookable barber(s). Add this barber as walk-in only, or upgrade your plan.`,
      };
    }
  }

  try {
    const barber = await db.barber.create({
      data: { salonId, name: input.name, title: input.title, bio: input.bio, bookableOnline: input.bookableOnline },
    });
    // Default schedule: closed every day until the owner sets working hours.
    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
      await db.barberWorkingHours.create({ data: { barberId: barber.id, dayOfWeek, isOff: true } });
    }
    revalidatePath(`/dashboard/${salonId}/barbers`);
    return { barber };
  } catch (e) {
    if (isExclusionViolation(e) || isBarberLimitTriggerError(e)) {
      return { error: "This salon's online-barber limit was reached. Please refresh and try again." };
    }
    throw e;
  }
}

export async function updateBarber(
  barberId: string,
  salonId: string,
  input: { name: string; title?: string; bio?: string; bookableOnline: boolean; active: boolean }
) {
  await requireSalonOwner(salonId);

  if (input.bookableOnline) {
    const barber = await db.barber.findUniqueOrThrow({ where: { id: barberId } });
    if (!barber.bookableOnline) {
      const [limit, currentOnlineCount] = await Promise.all([
        getOnlineBarberLimit(salonId),
        db.barber.count({ where: { salonId, bookableOnline: true } }),
      ]);
      if (currentOnlineCount >= limit) {
        return { error: `Your plan allows a maximum of ${limit} online-bookable barber(s).` };
      }
    }
  }

  try {
    await db.barber.update({
      where: { id: barberId },
      data: { name: input.name, title: input.title, bio: input.bio, bookableOnline: input.bookableOnline, active: input.active },
    });
  } catch (e) {
    if (isBarberLimitTriggerError(e)) {
      return { error: "This salon's online-barber limit was reached." };
    }
    throw e;
  }

  revalidatePath(`/dashboard/${salonId}/barbers`);
  return { success: true };
}

export async function setBarberWorkingHours(
  barberId: string,
  salonId: string,
  hours: { dayOfWeek: number; isOff: boolean; startMin: number | null; endMin: number | null }[]
) {
  await requireSalonOwner(salonId);
  await db.$transaction(
    hours.map((h) =>
      db.barberWorkingHours.upsert({
        where: { barberId_dayOfWeek: { barberId, dayOfWeek: h.dayOfWeek } },
        update: { isOff: h.isOff, startMin: h.startMin, endMin: h.endMin },
        create: { barberId, dayOfWeek: h.dayOfWeek, isOff: h.isOff, startMin: h.startMin, endMin: h.endMin },
      })
    )
  );
  revalidatePath(`/dashboard/${salonId}/barbers/${barberId}`);
  return { success: true };
}

export async function setBarberBreak(
  barberId: string,
  salonId: string,
  dayOfWeek: number,
  breakInput: { startMin: number; endMin: number; label?: string } | null
) {
  await requireSalonOwner(salonId);
  await db.barberBreak.deleteMany({ where: { barberId, dayOfWeek } });
  if (breakInput) {
    await db.barberBreak.create({ data: { barberId, dayOfWeek, ...breakInput } });
  }
  revalidatePath(`/dashboard/${salonId}/barbers/${barberId}`);
  return { success: true };
}

export async function setBarberServices(barberId: string, salonId: string, serviceIds: string[]) {
  await requireSalonOwner(salonId);
  await db.$transaction([
    db.barberService.deleteMany({ where: { barberId } }),
    db.barberService.createMany({ data: serviceIds.map((serviceId) => ({ barberId, serviceId })) }),
  ]);
  revalidatePath(`/dashboard/${salonId}/barbers/${barberId}`);
  return { success: true };
}

function isBarberLimitTriggerError(e: unknown): boolean {
  return e instanceof Error && e.message.includes("already has") && e.message.includes("online-bookable");
}
