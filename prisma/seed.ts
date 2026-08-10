import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Minutes-from-midnight helper for OpeningHours/BarberWorkingHours/BarberBreak.
const min = (h: number, m = 0) => h * 60 + m;

function bookingReference() {
  return `BM-${Math.floor(10000 + Math.random() * 90000)}`;
}

async function upsertPlan(name: string, maxOnlineBarbers: number) {
  return prisma.subscriptionPlan.upsert({
    where: { name },
    update: { maxOnlineBarbers },
    create: { name, maxOnlineBarbers },
  });
}

async function upsertUser(email: string, name: string, password: string, isSuperAdmin = false) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, isSuperAdmin },
    create: { email, name, passwordHash, isSuperAdmin },
  });
}

type SalonSeed = {
  slug: string;
  name: string;
  suburb: string;
  state: string;
  postcode: string;
  address: string;
  lat: number;
  lng: number;
  ownerEmail: string;
  barbers: { name: string; title: string; linkLogin?: string }[];
  services: { name: string; priceCents: number; durationMinutes: number }[];
};

const SALONS: SalonSeed[] = [
  {
    slug: "brisbane-barber-co",
    name: "Brisbane Barber Co.",
    address: "142 Adelaide Street",
    suburb: "Brisbane City",
    state: "QLD",
    postcode: "4000",
    lat: -27.4698,
    lng: 153.0251,
    ownerEmail: "owner.brisbanebarberco@bookmysalon.test",
    barbers: [
      { name: "John", title: "Senior Barber", linkLogin: "john.bbc@bookmysalon.test" },
      { name: "Mike", title: "Barber" },
    ],
    services: [
      { name: "Haircut", priceCents: 3000, durationMinutes: 30 },
      { name: "Haircut + Beard", priceCents: 4500, durationMinutes: 45 },
      { name: "Beard Trim", priceCents: 2000, durationMinutes: 20 },
      { name: "Kids Haircut", priceCents: 2500, durationMinutes: 30 },
      { name: "Hair Colour", priceCents: 10000, durationMinutes: 90 },
    ],
  },
  {
    slug: "classic-cuts",
    name: "Classic Cuts",
    address: "58 Boundary Street",
    suburb: "West End",
    state: "QLD",
    postcode: "4101",
    lat: -27.4823,
    lng: 153.0111,
    ownerEmail: "owner.classiccuts@bookmysalon.test",
    barbers: [{ name: "David", title: "Owner Barber" }],
    services: [
      { name: "Haircut", priceCents: 3500, durationMinutes: 30 },
      { name: "Beard Trim", priceCents: 2000, durationMinutes: 20 },
      { name: "Haircut + Beard", priceCents: 5000, durationMinutes: 45 },
    ],
  },
  {
    slug: "urban-hair",
    name: "Urban Hair",
    address: "301 Given Terrace",
    suburb: "Paddington",
    state: "QLD",
    postcode: "4064",
    lat: -27.4611,
    lng: 153.0003,
    ownerEmail: "owner.urbanhair@bookmysalon.test",
    barbers: [
      { name: "Sarah", title: "Senior Stylist" },
      { name: "Emma", title: "Stylist" },
    ],
    services: [
      { name: "Haircut", priceCents: 4000, durationMinutes: 30 },
      { name: "Hair Colour", priceCents: 12000, durationMinutes: 90 },
      { name: "Kids Haircut", priceCents: 2800, durationMinutes: 30 },
    ],
  },
];

async function main() {
  console.log("Seeding subscription plans...");
  await upsertPlan("FREE", 1);
  const basicPlan = await upsertPlan("BASIC", 2);
  await upsertPlan("PRO", 10);

  console.log("Seeding super admin...");
  await upsertUser("admin@bookmysalon.test", "Platform Admin", "password123", true);

  console.log("Seeding demo customer...");
  await upsertUser("customer@bookmysalon.test", "James Customer", "password123");

  for (const s of SALONS) {
    console.log(`Seeding salon: ${s.name}...`);
    const owner = await upsertUser(s.ownerEmail, `${s.name} Owner`, "password123");

    const salon = await prisma.salon.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        address: s.address,
        suburb: s.suburb,
        state: s.state,
        postcode: s.postcode,
        lat: s.lat,
        lng: s.lng,
        approvalStatus: "APPROVED",
      },
      create: {
        slug: s.slug,
        name: s.name,
        address: s.address,
        suburb: s.suburb,
        state: s.state,
        postcode: s.postcode,
        lat: s.lat,
        lng: s.lng,
        approvalStatus: "APPROVED",
        phone: "07 3000 0000",
        email: s.ownerEmail,
      },
    });

    await prisma.salonSubscription.upsert({
      where: { salonId: salon.id },
      update: { planId: basicPlan.id },
      create: { salonId: salon.id, planId: basicPlan.id },
    });

    const existingOwnerStaff = await prisma.salonStaff.findUnique({
      where: { userId_salonId: { userId: owner.id, salonId: salon.id } },
    });
    if (!existingOwnerStaff) {
      await prisma.salonStaff.create({
        data: { userId: owner.id, salonId: salon.id, role: "OWNER" },
      });
    }

    // Mon-Sat 9-6, closed Sunday.
    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
      const isClosed = dayOfWeek === 0;
      await prisma.openingHours.upsert({
        where: { salonId_dayOfWeek: { salonId: salon.id, dayOfWeek } },
        update: { isClosed, openMin: isClosed ? null : min(9), closeMin: isClosed ? null : min(18) },
        create: {
          salonId: salon.id,
          dayOfWeek,
          isClosed,
          openMin: isClosed ? null : min(9),
          closeMin: isClosed ? null : min(18),
        },
      });
    }

    // No natural unique key on (salonId, name) by design (owners can rename
    // services freely) — find-or-create instead, so re-running seed stays idempotent.
    const services = [];
    for (const svc of s.services) {
      let service = await prisma.service.findFirst({ where: { salonId: salon.id, name: svc.name } });
      if (!service) {
        service = await prisma.service.create({
          data: { salonId: salon.id, name: svc.name, priceCents: svc.priceCents, durationMinutes: svc.durationMinutes },
        });
      }
      services.push(service);
    }

    const barbers = [];
    for (const b of s.barbers) {
      let barber = await prisma.barber.findFirst({ where: { salonId: salon.id, name: b.name } });
      if (!barber) {
        barber = await prisma.barber.create({
          data: { salonId: salon.id, name: b.name, title: b.title, bookableOnline: true },
        });
      }
      barbers.push(barber);

      // Mon-Sat 9-5, Sunday off, lunch break 12:30-1:00.
      for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        const isOff = dayOfWeek === 0;
        await prisma.barberWorkingHours.upsert({
          where: { barberId_dayOfWeek: { barberId: barber.id, dayOfWeek } },
          update: { isOff, startMin: isOff ? null : min(9), endMin: isOff ? null : min(17) },
          create: {
            barberId: barber.id,
            dayOfWeek,
            isOff,
            startMin: isOff ? null : min(9),
            endMin: isOff ? null : min(17),
          },
        });
        if (!isOff) {
          const existingBreak = await prisma.barberBreak.findFirst({ where: { barberId: barber.id, dayOfWeek } });
          if (!existingBreak) {
            await prisma.barberBreak.create({
              data: { barberId: barber.id, dayOfWeek, startMin: min(12, 30), endMin: min(13), label: "Lunch" },
            });
          }
        }
      }

      // Every barber can perform every service at this salon (simplification for seed data).
      for (const service of services) {
        await prisma.barberService.upsert({
          where: { barberId_serviceId: { barberId: barber.id, serviceId: service.id } },
          update: {},
          create: { barberId: barber.id, serviceId: service.id },
        });
      }

      if (b.linkLogin) {
        const barberUser = await upsertUser(b.linkLogin, b.name, "password123");
        const existingStaff = await prisma.salonStaff.findFirst({ where: { barberId: barber.id } });
        if (!existingStaff) {
          await prisma.salonStaff.create({
            data: { userId: barberUser.id, salonId: salon.id, role: "BARBER", barberId: barber.id },
          });
        }
      }
    }

    // Demo bookings for tomorrow on the first barber, matching the spec's
    // worked availability example (10:00-10:30, 11:30-12:00, 2:00-2:45pm).
    if (salon.slug === "brisbane-barber-co") {
      const john = barbers[0];
      const haircut = services.find((s) => s.name === "Haircut")!;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const demoSlots: [number, number][] = [
        [min(10), min(10, 30)],
        [min(11, 30), min(12)],
        [min(14), min(14, 45)],
      ];

      for (const [startMin, endMin] of demoSlots) {
        const startAt = new Date(tomorrow.getTime() + startMin * 60_000);
        const endAt = new Date(tomorrow.getTime() + endMin * 60_000);
        const existing = await prisma.booking.findFirst({ where: { barberId: john.id, startAt } });
        if (!existing) {
          await prisma.booking.create({
            data: {
              reference: bookingReference(),
              salonId: salon.id,
              barberId: john.id,
              serviceId: haircut.id,
              guestName: "Demo Walk-in Customer",
              guestPhone: "0400000000",
              startAt,
              endAt,
              serviceNameSnapshot: haircut.name,
              priceCentsSnapshot: haircut.priceCents,
              durationMinutesSnapshot: haircut.durationMinutes,
              status: "CONFIRMED",
              source: "ONLINE",
            },
          });
        }
      }
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
