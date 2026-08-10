# BookMySalon — Handover

Working name for a HotDoc-style salon/barber booking marketplace. Full MVP built 2026-08-10 in one session, from a detailed product spec. This doc lets a fresh session pick up without re-reading the whole conversation.

## What's built (all verified live in-browser, not just type-checked)

- **Customer**: homepage with hero search + near-me (geolocation), `/search` with filters, salon profile, barber profile, 6-step booking wizard (service → barber → date → time → details → confirm) with guest checkout + "any available barber" auto-assignment, booking confirmation page with a `BM-XXXXX` reference.
- **Customer account** (`/account`): upcoming/past/cancelled bookings, cancel, reschedule (re-checks live availability), leave a review (completed bookings only, one per booking), favourite salons/barbers with quick rebook.
- **Salon owner dashboard** (`/dashboard/[salonId]`): today stats, daily calendar grid (time × barber), bookings list with walk-in creation and full status lifecycle (CONFIRMED→ARRIVED→IN_SERVICE→COMPLETED, plus CANCELLED/NO_SHOW), barbers CRUD (schedule/breaks/services editor), services CRUD, opening hours editor, blocked-time CRUD, salon profile editor. Barber-role staff see a restricted nav (their own bookings/calendar only).
- **Admin** (`/admin`, `User.isSuperAdmin`): platform stats, salon approve/reject/suspend (only `APPROVED` salons are ever publicly visible — enforced via `publicSalonWhere()` in `src/lib/salon-search.ts`), customers table, bookings table.
- **Auth**: NextAuth v5 credentials + PrismaAdapter. Salon registration (`/register/salon`) creates a `PENDING_APPROVAL` salon.

## The two guarantees that actually matter

1. **Double-booking protection** — a hand-written Postgres `EXCLUDE USING gist` constraint on `Booking` (`barberId` + `tsrange(startAt, endAt)`, excluding CANCELLED/NO_SHOW), not just an app-level check. See the bottom of `prisma/migrations/20260810100414_init/migration.sql`. Proven with a real concurrent-race integration test in `src/lib/booking/create-booking.integration.test.ts` — two overlapping inserts fired simultaneously, exactly one wins.
2. **Max 2 online-bookable barbers per salon** — enforced by a Postgres trigger (`enforce_online_barber_limit`, same migration file) reading `SalonSubscription.plan.maxOnlineBarbers` (defaults to 2). A friendly app-level pre-check lives in `src/lib/actions/barbers.ts` so owners get a real error message instead of a raw Postgres exception. Salons can still add extra walk-in-only barbers (`bookableOnline: false`) beyond the cap — verified live.

## Known gaps (deliberately out of MVP scope, or noted for later)

- No payments, no billed subscriptions (the `SubscriptionPlan`/`SalonSubscription` tables exist and are wired to the barber-limit trigger, just not charged for).
- No SMS/WhatsApp, no live queue/delay indicator, no customer check-in queue position.
- Reminder emails are fully built (`src/lib/notifications/booking-emails.ts`, `/api/cron/reminders`) but **not scheduled** — no Vercel Cron entry wired up yet. Booking *confirmation* emails ARE wired in and fire on every booking.
- Email sending falls back to console logging in dev when `RESEND_API_KEY` is unset (see `src/lib/notifications/email.ts`) — set that env var (and `EMAIL_FROM`) to actually send.
- No dark mode `ThemeProvider` wired up (shadcn scaffolded `next-themes` as a dependency but nothing uses it) — the spec never asked for dark mode, so this was left alone rather than scope-creeped.
- Google Maps / real geocoding isn't wired in — salon registration and "near me" both rely on the browser's own geolocation API, no address→lat/lng geocoding service.

## Environment / dev quirks worth knowing

- Neon Postgres was provisioned via `vercel integration add neon --plan free_v3` (Vercel project `dkns/bookmysalon`) — the Vercel org here is Vercel-managed, so `neonctl projects create` directly is blocked; must go through Vercel's marketplace integration.
- Dev server is registered in the **global** `~/.claude/launch.json` (not a per-project `.claude/launch.json`, which the Browser preview tool here ignores) as `"bookmysalon"`, port 3014.
- Prisma 7's custom client output lives at `src/generated/prisma` (gitignored) — always import from `@/generated/prisma/client`, and remember `db.ts` builds its client via `@prisma/adapter-pg`, not a bare `PrismaClient`.
- `src/lib/date.ts` (`localDateStr`/`dateStrInZone`) exists because `toISOString().slice(0,10)` silently rolls the calendar date back a day on this UTC+10 (AEST) machine whenever local time is past midnight but UTC hasn't rolled over yet — a real bug found and fixed mid-build. Never use raw `toISOString()` for calendar-date extraction anywhere in this codebase.
- Integration tests (`npm run test:integration`) spin up a local `prisma dev` Postgres server (real Postgres, supports `btree_gist`) on port 51222 (not the `--db-port` flag's requested port — it seems to ignore that flag in this environment and auto-assign; `test/integration-global-setup.ts` hardcodes the observed port).

## Seed data (all logins `password123`)

3 approved demo salons in Brisbane suburbs: Brisbane Barber Co. (John, Mike), Classic Cuts (David), Urban Hair (Sarah, Emma). Accounts: `admin@bookmysalon.test` (super admin), `customer@bookmysalon.test`, `owner.<slug>@bookmysalon.test` per salon, `john.bbc@bookmysalon.test` (barber-role login demo). Re-run with `npm run db:seed` (idempotent — upserts/find-or-creates throughout).

## Suggested next steps

1. Set `RESEND_API_KEY` + `EMAIL_FROM` and wire a Vercel Cron entry to `/api/cron/reminders` to actually activate reminder emails.
2. Deploy to Vercel (`vercel-build` script already runs `prisma migrate deploy && next build`) and confirm the migration (including the exclusion constraint + trigger) applies cleanly against the production Neon branch.
3. Decide on subscription billing before opening the platform to real salon signups (barber-limit plumbing is ready, nothing is charged yet).
