"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { slugify } from "@/lib/slugify";

const registerCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().min(1, "Mobile number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerCustomer(input: z.infer<typeof registerCustomerSchema>) {
  const parsed = registerCustomerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "An account with this email already exists" };

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
    },
  });

  return { userId: user.id };
}

const registerSalonSchema = z.object({
  ownerName: z.string().min(1, "Your name is required"),
  ownerEmail: z.email("Enter a valid email"),
  ownerPhone: z.string().min(1, "Mobile number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  salonName: z.string().min(1, "Salon name is required"),
  address: z.string().min(1, "Address is required"),
  suburb: z.string().min(1, "Suburb is required"),
  state: z.string().min(1, "State is required"),
  postcode: z.string().min(1, "Postcode is required"),
  lat: z.number(),
  lng: z.number(),
});

/**
 * Self-service salon registration. Creates the owner's User account, a Salon
 * row in PENDING_APPROVAL (invisible to public search until a super admin
 * approves it — see requireSuperAdmin-gated admin actions), and links the
 * owner via SalonStaff. Defaults to the BASIC plan (2 online barbers) so the
 * owner can add both barbers from the spec's MVP example immediately.
 */
export async function registerSalon(input: z.infer<typeof registerSalonSchema>) {
  const parsed = registerSalonSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email: data.ownerEmail } });
  if (existingUser) return { error: "An account with this email already exists" };

  const passwordHash = await hashPassword(data.password);
  const slug = await uniqueSlug(data.salonName);

  const basicPlan = await db.subscriptionPlan.findUnique({ where: { name: "BASIC" } });

  const result = await db.$transaction(async (tx) => {
    const owner = await tx.user.create({
      data: {
        name: data.ownerName,
        email: data.ownerEmail,
        phone: data.ownerPhone,
        passwordHash,
      },
    });

    const salon = await tx.salon.create({
      data: {
        slug,
        name: data.salonName,
        address: data.address,
        suburb: data.suburb,
        state: data.state,
        postcode: data.postcode,
        lat: data.lat,
        lng: data.lng,
        email: data.ownerEmail,
        approvalStatus: "PENDING_APPROVAL",
      },
    });

    await tx.salonStaff.create({
      data: { userId: owner.id, salonId: salon.id, role: "OWNER" },
    });

    if (basicPlan) {
      await tx.salonSubscription.create({
        data: { salonId: salon.id, planId: basicPlan.id },
      });
    }

    return { ownerId: owner.id, salonId: salon.id, slug: salon.slug };
  });

  return result;
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  let n = 1;
  while (await db.salon.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}
