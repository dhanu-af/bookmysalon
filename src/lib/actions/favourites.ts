"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function toggleFavouriteSalon(salonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to save favourites" };

  const existing = await db.favouriteSalon.findUnique({
    where: { userId_salonId: { userId: session.user.id, salonId } },
  });

  if (existing) {
    await db.favouriteSalon.delete({ where: { id: existing.id } });
    revalidatePath("/account/favourites");
    return { favourited: false };
  }

  await db.favouriteSalon.create({ data: { userId: session.user.id, salonId } });
  revalidatePath("/account/favourites");
  return { favourited: true };
}

export async function toggleFavouriteBarber(barberId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to save favourites" };

  const existing = await db.favouriteBarber.findUnique({
    where: { userId_barberId: { userId: session.user.id, barberId } },
  });

  if (existing) {
    await db.favouriteBarber.delete({ where: { id: existing.id } });
    revalidatePath("/account/favourites");
    return { favourited: false };
  }

  await db.favouriteBarber.create({ data: { userId: session.user.id, barberId } });
  revalidatePath("/account/favourites");
  return { favourited: true };
}

export async function isFavouriteSalon(salonId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const existing = await db.favouriteSalon.findUnique({
    where: { userId_salonId: { userId: session.user.id, salonId } },
  });
  return !!existing;
}

export async function isFavouriteBarber(barberId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const existing = await db.favouriteBarber.findUnique({
    where: { userId_barberId: { userId: session.user.id, barberId } },
  });
  return !!existing;
}
