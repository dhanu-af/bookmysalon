# Handover — 2026-08-11 21:40

## Goal

Build BookMySalon: a HotDoc-style salon/barber booking marketplace (customer search/booking, salon owner dashboard, admin approval), from a detailed product spec. The full MVP was built and deployed in one long session; this second phase is adding the six items the spec explicitly deferred ("architect for later, don't build yet"), one at a time, per the user's direct request: reminder-email scheduling, live queue/delay indicator, customer check-in queue position, payments/billing architecture, SMS/WhatsApp architecture, geocoding architecture.

## State

**MVP: 100% complete and live**, matching every item on the spec's own MVP checklist (customer search/booking/account, salon owner dashboard, admin approval) — see the "What's built" section below.

**Deferred-items phase: 6 of 6 fully done and verified.**

- ✅ Live status indicator (`Salon.runningStatus`) — done, verified live
- ✅ Queue position for checked-in customers — done, verified live
- ✅ Billing/subscription architecture (no real charging) — done, verified live
- ✅ SMS/WhatsApp stub (dev-mode fallback, plan-gated) — done, verified live
- ✅ Geocoding architecture (Google Maps fallback) — done, verified live
- ✅ **Reminder-email cron — fully done.** User added `CRON_SECRET` to Vercel manually. Confirmed enforced by curling `/api/cron/reminders`: no-auth and wrong-token requests now correctly 401 (previously both 200, since the route's check `if (process.env.CRON_SECRET && authHeader !== ...)` is a no-op while the env var is unset). **All 6 of the 6 originally-deferred items are now fully done and live.**

**Additionally this session**: added an `/admin/notifications` page (nav item + table) so sent/failed `Notification` rows (email + SMS, any type) are visible in the UI instead of only via server logs/raw DB — this was next-step item #4 from the previous handover. Verified live by logging in as `admin@bookmysalon.test` and confirming real rows render (including three real `RESEND_API_KEY not configured` FAILED rows from earlier testing). Committed as `37664c5` and pushed.

**Deployment**: everything is pushed to `main` on GitHub (`dhanu-af/bookmysalon`) and auto-deploys to the correct Vercel project. Latest deploy before this session's commit was `dpl_2oCaK46VNYmCkL6JLkht58KwV6u9` (`READY`, production) at **https://bookmysalon-nu.vercel.app**; commit `37664c5` will auto-deploy next. Local dev DB and production DB are both migrated to the latest schema and seeded.

## Key decisions

- **Two Vercel accounts exist on this machine and this caused real confusion mid-session** — see "Gotchas" below, it's important context for any further deploy work.
- **Payments/SMS/WhatsApp/Maps are architecture-only, not live**, and this was deliberate, not a shortcut: the user's spec explicitly said "architect for later," and building real Stripe/Twilio/Google integrations without real credentials (which nobody has provided) would mean either fabricating a fake payment flow or leaving broken code — neither is acceptable. Real payment processing is also outside what Claude is ever allowed to execute, regardless of credentials. The pattern used everywhere (email, SMS, geocoding) is identical: **try the real API if credentials are configured; otherwise log to console and return a clear error/no-op** — so flipping these on later is purely an env-var change, no code change.
- **SMS is plan-gated** (`SubscriptionPlan.smsEnabled`), matching the spec's tiering (PRO includes SMS, BASIC/FREE don't) — `sendBookingConfirmationSms()` checks this before attempting to send, verified by bumping a salon to PRO and back down.
- **The seed script was refactored mid-session** into a shared `seedDemoData()` function (`src/lib/seed-data.ts`) so it could run two ways: locally via `prisma/seed.ts` (has its own DB connection string) and against production via `GET /api/admin/seed?secret=...` (uses the deployed app's own runtime `DATABASE_URL`, since there was no local connection string for the production database). The route reuses `AUTH_SECRET` as its bearer token rather than requiring yet another manually-added env var.
- **`server-only` cannot be imported by any file that might run via a standalone `tsx` script** (prisma/seed.ts, or any one-off verification script) — it only resolves inside Next's own compiler. Learned this twice: once for `seed-data.ts`, once for `sms.ts`/`booking-sms.ts`. If you add a new `lib/notifications/*` or `lib/seed-data`-adjacent file and it needs standalone-script testability, don't add `import "server-only"` to it.

## Files touched (this session, since the MVP handover)

- `prisma/schema.prisma` — added `Salon.runningStatus` (+ `SalonRunningStatus` enum), `SubscriptionPlan.priceCentsMonthly/smsEnabled/advancedAnalytics`, `SalonSubscription.status` (+ `SalonSubscriptionStatus` enum). Two new migrations: `20260811104820_add_salon_running_status`, `20260811105604_add_billing_fields`. Both applied locally and in production.
- `vercel.json` — new. Cron entry for `/api/cron/reminders`, daily at `0 9 * * *` UTC (7pm AEST — evening-before reminders for tomorrow's bookings).
- `src/lib/salon-status.ts`, `src/lib/actions/salon-status.ts`, `src/app/dashboard/[salonId]/running-status-widget.tsx` — live status feature. Wired into dashboard home, salon profile page, salon search cards.
- `src/lib/booking/queue-position.ts` — queue position calculation, wired into `/account/bookings` via `booking-row.tsx`.
- `src/lib/seed-data.ts` — refactored out of `prisma/seed.ts` (now a thin wrapper), also used by `src/app/api/admin/seed/route.ts` (new, production one-time seed endpoint).
- `src/app/dashboard/[salonId]/settings/page.tsx` — new billing/plans preview page, all "Upgrade" buttons honestly disabled ("Coming soon").
- `src/lib/notifications/sms.ts`, `src/lib/notifications/booking-sms.ts` — Twilio REST API via plain fetch (no SDK), dev-mode console fallback, plan-gated. Wired into `create-booking.ts` fire-and-forget alongside the existing email send.
- `src/lib/geo/geocode.ts` — Google Maps Geocoding API fallback, wired into `src/lib/actions/auth.ts`'s `registerSalon()` as a fallback when the owner doesn't share geolocation (`lat`/`lng` are now optional in that action's zod schema).

## Gotchas / constraints learned

- **This machine has two separate Vercel accounts/logins**, and they surfaced mid-session in a way that caused real duplicate-resource confusion:
  - The `vercel` **CLI** is authenticated as a different account (team slug `dkns`, e.g. `luxlibrary-os`, `nexora-finance-os`, `nutriai`, `villageride` live there) — NOT the user's primary account.
  - The **Vercel MCP tools** (`mcp__vercel__*`) and the user's own browser session are a *different* account (team `dkns1`/"DKNS", where `brain`, `refundpilot`, `fudgee`, `tea-estate-system`, etc. live) — this is the account BookMySalon is actually deployed under.
  - Both are legitimately the user's own accounts (not one "wrong" one) — she just has her real portfolio split across two. **The CLI cannot reach the `dkns1` team at all** (`vercel teams list` only shows `dkns`), so any further Vercel env-var/project changes for BookMySalon must go through the `mcp__vercel__*` tools (with `teamId: "team_IFsD28fF0XXuFVwrVhrnLXnX"`, `projectId: "prj_jP4lsHlnIobBmFStAVSXjaFnPea4"`) or ask the user to do it in her dashboard — never assume the CLI's `dkns` scope is correct for this project.
  - The MCP Vercel tools have **read access but no env-var-write tool** — there is no `mcp__vercel__*` tool to add/update environment variables. Any new env var needs the user to add it manually in the dashboard (Settings → Environment Variables), or needs a code-level workaround like reusing an existing secret (as done for the seed route).
- **Vercel's Neon integration on a Vercel-managed org blocks `neonctl projects create` directly** — must go through `vercel integration add neon --plan free_v3 -m region=... -m auth=false`.
- **Query-string secrets need `encodeURIComponent`** — a base64 secret containing `+`/`/` silently 401'd until properly percent-encoded (`+` decodes to a literal space in query strings).
- **`db.ts`'s Prisma client singleton doesn't pick up a freshly-`prisma generate`'d client without restarting the dev server** — hit this after the billing migration; regenerating the client while the dev server is still running from before the regen leaves it serving the old client shape (`Unknown argument` errors) until you stop/restart the preview server.
- **This machine's system clock is UTC+10 (AEST)** — relevant to any future date-boundary code; see `src/lib/date.ts` and its comment (a real bug was found and fixed here in the MVP phase — never use raw `toISOString().slice(0,10)` for calendar-date extraction anywhere in this codebase).
- Full list of MVP-phase gotchas (Prisma custom client output path, `prisma dev`'s actual port behavior, `base-ui`'s `render` prop instead of `asChild`, etc.) is preserved below in "Everything from the original MVP handover," since it's all still relevant.

## Next steps

All deferred-features work is done. What's left is explicitly **on hold per the user's direct instruction** ("hold to phase 2") — do not chase these proactively, only act if she raises them again:

1. Setting real `RESEND_API_KEY`/`EMAIL_FROM`, `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_FROM_NUMBER`, and `GOOGLE_MAPS_API_KEY` — all three architectures already activate with zero code changes once the env vars exist; there's nothing further to build here without real credentials.
2. Deciding on real billing/Stripe integration before opening the platform to real (non-seed) salon signups — the data model and plan-gating logic are ready, nothing is connected to a real payment processor.

## Open questions

- None. Both remaining items are deliberately deferred to a later phase per the user, not blocked on anything Claude needs to resolve.

---

## Everything from the original MVP handover (still accurate, preserved for reference)

### What's built (all verified live in-browser, not just type-checked)

- **Customer**: homepage with hero search + near-me (geolocation), `/search` with filters, salon profile, barber profile, 6-step booking wizard (service → barber → date → time → details → confirm) with guest checkout + "any available barber" auto-assignment, booking confirmation page with a `BM-XXXXX` reference.
- **Customer account** (`/account`): upcoming/past/cancelled bookings, cancel, reschedule (re-checks live availability), leave a review (completed bookings only, one per booking), favourite salons/barbers with quick rebook.
- **Salon owner dashboard** (`/dashboard/[salonId]`): today stats, daily calendar grid (time × barber), bookings list with walk-in creation and full status lifecycle (CONFIRMED→ARRIVED→IN_SERVICE→COMPLETED, plus CANCELLED/NO_SHOW), barbers CRUD (schedule/breaks/services editor), services CRUD, opening hours editor, blocked-time CRUD, salon profile editor, settings/billing preview. Barber-role staff see a restricted nav (their own bookings/calendar only).
- **Admin** (`/admin`, `User.isSuperAdmin`): platform stats, salon approve/reject/suspend (only `APPROVED` salons are ever publicly visible — enforced via `publicSalonWhere()` in `src/lib/salon-search.ts`), customers table, bookings table.
- **Auth**: NextAuth v5 credentials + PrismaAdapter. Salon registration (`/register/salon`) creates a `PENDING_APPROVAL` salon.

### The two guarantees that actually matter

1. **Double-booking protection** — a hand-written Postgres `EXCLUDE USING gist` constraint on `Booking` (`barberId` + `tsrange(startAt, endAt)`, excluding CANCELLED/NO_SHOW), not just an app-level check. See the bottom of `prisma/migrations/20260810100414_init/migration.sql`. Proven with a real concurrent-race integration test in `src/lib/booking/create-booking.integration.test.ts` — two overlapping inserts fired simultaneously, exactly one wins.
2. **Max 2 online-bookable barbers per salon** — enforced by a Postgres trigger (`enforce_online_barber_limit`, same migration file) reading `SalonSubscription.plan.maxOnlineBarbers` (defaults to 2). A friendly app-level pre-check lives in `src/lib/actions/barbers.ts` so owners get a real error message instead of a raw Postgres exception. Salons can still add extra walk-in-only barbers (`bookableOnline: false`) beyond the cap — verified live.

### Environment / dev quirks worth knowing

- Dev server is registered in the **global** `~/.claude/launch.json` (not a per-project `.claude/launch.json`, which the Browser preview tool here ignores) as `"bookmysalon"`, port 3014.
- Prisma 7's custom client output lives at `src/generated/prisma` (gitignored) — always import from `@/generated/prisma/client`, and remember `db.ts` builds its client via `@prisma/adapter-pg`, not a bare `PrismaClient`.
- Integration tests (`npm run test:integration`) spin up a local `prisma dev` Postgres server (real Postgres, supports `btree_gist`) on port 51222 (not the `--db-port` flag's requested port — it seems to ignore that flag in this environment and auto-assign; `test/integration-global-setup.ts` hardcodes the observed port).
- shadcn's `base-nova` style uses `@base-ui/react`, which uses a `render` prop instead of Radix's `asChild` pattern — e.g. `<DialogTrigger render={<Button>Add</Button>} />`, not `<DialogTrigger asChild><Button>Add</Button></DialogTrigger>`.

### Seed data (all logins `password123`)

3 approved demo salons in Brisbane suburbs: Brisbane Barber Co. (John, Mike), Classic Cuts (David), Urban Hair (Sarah, Emma). Accounts: `admin@bookmysalon.test` (super admin), `customer@bookmysalon.test`, `owner.<slug>@bookmysalon.test` per salon, `john.bbc@bookmysalon.test` (barber-role login demo). Re-run with `npm run db:seed` locally (idempotent), or `GET /api/admin/seed?secret=<AUTH_SECRET, URL-encoded>` against production.
