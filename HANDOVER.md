# Handover — 2026-08-12 (current time in-session)

## Goal

Build and iteratively improve BookMySalon: a HotDoc-style salon/barber booking marketplace (customer search/booking, salon owner dashboard, admin approval). The MVP and all 6 spec-deferred features ("architect for later") shipped in earlier sessions. This session's work was two more user-directed increments: (1) close out the one item left dangling from last time, (2) rebuild the homepage to match a Figma Make design the user created herself, while keeping the rest of the app untouched.

## State

**MVP + all 6 deferred features: 100% done and live.** `CRON_SECRET` (the one item still open at the start of this session) was added to Vercel by the user and is now confirmed enforced — curling `/api/cron/reminders` with no/wrong token now correctly 401s (previously both returned 200, since the route's check `if (process.env.CRON_SECRET && ...)` was a no-op while the var was unset).

**Admin `/admin/notifications` page**: done, live. Surfaces every `Notification` row (email/SMS, any type/status) with recipient, linked booking, and failure reason — there was previously no UI for this at all.

**Homepage rebuilt from the user's Figma Make design**: done, live, verified in-browser. See "Key decisions" for how — this was a bigger effort than it sounds because of Figma access friction.

**Explicitly on hold per the user ("hold to phase 2"), do not chase proactively:**
- Real `RESEND_API_KEY` / Twilio creds / `GOOGLE_MAPS_API_KEY` — architecture is done, these are pure env-var flips whenever she's ready.
- Real Stripe/billing integration — data model + plan-gating logic exist, nothing is connected to a real processor.

**Deployment**: pushed to `main` on GitHub (`dhanu-af/bookmysalon`), auto-deploys to Vercel team `dkns1`. Latest deploy `dpl_8rbtxyrdWyYHq8nn2EuHkpVX1mL7` (commit `95c84c2`) is `READY` in production at **https://bookmysalon-nu.vercel.app** — confirmed serving the new homepage (`curl` returns 200 and the new "Skip the / Queue." headline).

## Key decisions

- **Figma file access was the main obstacle, and the fix was to stop fighting it.** The user's Figma Make file was a personal draft on a free Starter team plan — drafts are view-only, granting edit access required moving it into a project, and creating a new project hit "free limit of 1 project." After a long back-and-forth in Figma's Share UI, we abandoned the Figma MCP tools (`get_design_context` needs *edit* access, which never materialized) and instead had the user click **Publish** in Figma Make to get a public `*.figma.site` URL. That URL needed no login and no MCP tool — the Browser tool (`javascript_tool`, reading `document.body.innerHTML` in ~28k-char chunks) pulled the **exact rendered Tailwind markup** (real classes, real hex colors, real copy, real Unsplash image URLs) directly from the live DOM. This was more reliable than the Figma API path would have been anyway. **If asked to implement another Figma design and MCP access is a hassle, try asking for a published Figma Make site link first.**
- **Scope was deliberately kept to "the homepage only," per the user's explicit "without change site."** Only [`src/app/(marketing)/page.tsx`](src/app/(marketing)/page.tsx) and new colocated files under `_home/` were touched. `SiteHeader`, `MarketingLayout`, and the shared `SalonCard` (used by `/search`) were **not** touched. Consequence: the new homepage's footer only exists on the homepage — no other marketing page has a footer — and the header above the new hero is still the plain existing `SiteHeader`, not the Figma design's own transparent-over-hero maroon-logo header. This was a conscious tradeoff, not an oversight — see "Open questions."
- **Every data-bearing section pulls from the real database instead of the Figma design's placeholder content.** The design had 4 fictional salons/barbers with made-up ratings; the real app already has 3 real seed salons with overlapping names (e.g. "Brisbane Barber Co." exists in both), so real data was used throughout: `getTopSalons`/`getTopBarbers`/`getRightNowCards`/`getTestimonials` in [`_home/homepage-data.ts`](src/app/(marketing)/_home/homepage-data.ts). The "Need a haircut today?" section only renders `if (rightNowCards.length > 0)` — it's correctly hidden right now because it's evening in Brisbane and no real slots remain today. Decorative-only mockups (the illustrative dashboard preview and "40 min saved" floating card in "Why book online") were kept static, matching the design, since they're UI chrome, not data claims.
- **Testimonials fall back to the design's sample quotes** because `getTestimonials()` (real 5-star reviews with a comment) returns empty — no seed data creates reviews. If real reviews get created later, they'll automatically replace the fallback.
- **Dropped the Figma design's 4th hero search field ("Time")** — there's no time-of-day filter in `searchSalons`/`getAvailableSlots`, and adding one wasn't asked for. Kept the 3 real fields (Service/Location/Date) with real routing to `/search`.
- **Deleted `src/components/customer/search-form.tsx` and `nearby-salons.tsx`** — both were only ever called by the old homepage, now dead code after the rewrite.

## Files touched

- [`src/app/(marketing)/page.tsx`](src/app/(marketing)/page.tsx) — full rewrite, new homepage matching the Figma design, real data throughout. Done.
- [`src/app/(marketing)/_home/hero-search.tsx`](src/app/(marketing)/_home/hero-search.tsx) — new restyled hero search widget (client component), real service/location/date logic preserved, routes to `/search`. Done.
- [`src/app/(marketing)/_home/homepage-data.ts`](src/app/(marketing)/_home/homepage-data.ts) — new data queries: `getTopSalons`, `getRightNowCards`, `getTopBarbers`, `getTestimonials`. Done.
- [`src/app/admin/notifications/page.tsx`](src/app/admin/notifications/page.tsx) + [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx) (nav link) — new admin notifications visibility page. Done, from earlier in this session.
- Deleted: `src/components/customer/search-form.tsx`, `src/components/customer/nearby-salons.tsx`.
- Commits this session: `4c3defe` (handover update), `95c84c2` (homepage rebuild). Both pushed and deployed READY.

## Gotchas / constraints learned

- **The Browser tool's `screenshot` action was unreliable this session** ("Browser pane is not displayed, so the page is not compositing frames"), repeatedly, even after waits/retries. Worked around it entirely using `get_page_text`, `read_page`, and `javascript_tool` DOM/computed-style inspection instead — don't burn time retrying screenshots if this happens again, just switch to text/JS-based verification.
- **The Browser pane session can silently disconnect mid-task.** Symptom: clicks stop having any effect (e.g. a Popover's `aria-expanded` stays `"false"` no matter what, even a direct `element.click()` in `javascript_tool` does nothing) with no error — until the *next* tool call returns `"No preview is open."` If interactions mysteriously stop working, suspect a dropped session before assuming a code bug: call `preview_start` again and retest cleanly. This cost significant time before the actual cause (a stale/disconnected tab) was identified — a real bug had already been fixed by that point, and the remaining "failure" was purely this disconnection artifact.
- **base-ui's `PopoverTrigger` already renders a `<button>`.** Never put another `<button>` as its child — causes "In HTML, `<button>` cannot be a descendant of `<button>`," a hydration error that breaks React event handling for the whole page (not just that component) until fixed. Use a plain `<div>` for custom trigger content instead. (Already fixed in `hero-search.tsx`'s `FieldButton`.)
- **Figma Make drafts on a free Starter team plan are view-only**, and enabling edit access requires moving the file into a project — which can hit a "1 free project" limit. The `Anyone: can view → can edit` toggle in Share settings is greyed out for drafts too. Publishing to a `*.figma.site` URL and reading the live DOM sidesteps all of this.
- Vercel two-account gotcha still applies (see project memory `project_bookmysalon.md`): the `vercel` CLI is logged into team `dkns`, unrelated to this project. This project lives under team `dkns1` — always pass `teamId: "team_IFsD28fF0XXuFVwrVhrnLXnX"` / `projectId: "prj_jP4lsHlnIobBmFStAVSXjaFnPea4"` to `mcp__vercel__*` tools.

## Next steps

Nothing is blocking. Two optional follow-ups exist only if the user asks:

1. If she wants the new cream/maroon Figma visual identity applied to the **site-wide header and footer** (not just the homepage), that requires touching `SiteHeader` and `MarketingLayout` — deliberately not done this session per "without change site."
2. Real credentials (Resend/Twilio/Google Maps) and Stripe billing remain on hold per her explicit instruction — don't start on these without her prompting it again.

## Open questions

- Does she want the site-wide header/footer restyled to match the new homepage's look, or is the plain existing header intentional/fine for the rest of the site? Not asked this session — the homepage was scoped conservatively to avoid overstepping "without change site," but it does mean the homepage's hero now sits under a header that doesn't visually match the new design below it.
