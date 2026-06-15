# Progress Tracker

## Phase

Offering taxonomy finalized (`one_on_one | live_event | digital`) with per-type
create + book/buy flows end-to-end. Booking flow live. Creator dashboard UI consolidated.
**Next: creator payouts + KYC + Razorpay Route money-split** (see
`docs/payouts-kyc-routing.md`). Uploads/S3 still stubbed.

## Done

**Infrastructure**

- Monorepo, Auth (Better Auth + Google + RBAC), global error handling, Font Awesome enforced
- API gzip compression (`main.ts`) — slot payloads ~85% smaller on wire

**Onboarding + Profiles**

- Creator 4-step onboarding, username availability check, public profile `/c/[username]` (redesigned)
- Creator/learner dashboards (learner data still mocked)
- Creator calendar/availability builder (schedule rules + overrides + Google Calendar connect)

**Booking Flow (web)** ✅

- Slot picker modal: month-calendar + scrollable time list (Calendly-style), skeleton/empty
  states, hover/press interactions, cursor states
- `useOfferingSlots` hook (react-query) — cached/deduped fetch; `slotsByDate`/`availableDates`
  memo-derived from single `slots` source
- Modal open + selection (offering/tz/start/end) driven by URL → browser Back from
  `/checkout` and shared links restore dialog
- Dedicated `/checkout` (secure layout, no nav/footer): guest + logged-in, Razorpay
  order → pay → confirm → success with Meet link
- Default tz = device tz; full IANA list via `Intl.supportedValuesOf`
- Responsive: whole modal scrolls on mobile, slots-only scroll on desktop (`grid-rows-1`), sticky CTA

**Offering Types — all 3, end-to-end** ✅ (2026-06-16)

- Taxonomy finalized: `one_on_one | live_event | digital`. `workshop`/`group` **removed**
  entirely (code + DB enum recreated); `live_event` carries `metadata.format: group|webinar`.
  `course` parked as a future separate type. See `docs/offerings-type-flows.md`.
- Create: offer-form per-type fields — 1:1 (duration + booking window), live_event
  (`scheduledAt` + format preset + seats), digital (delivery editor: files + external link
  + instructions). API DTO/service persist `scheduledAt` + `metadata`.
- Book/buy: offering-card per-type CTA (Book / Register / Get access) + sold-out; 1:1 → slot
  picker, live_event/digital → straight to `/checkout`. Checkout branches per type (copy +
  payload + summary). Bookings API: live_event (fixed time + atomic seats), digital (instant,
  no meeting).
- **Uploads = STUB** (`apps/api/src/uploads`): presign/confirm/delete/digital-access return
  correctly-shaped placeholders, **no AWS yet**. Web `storage.service` records the presigned
  key but skips the real S3 PUT. Wire S3 + CloudFront per `docs/s3-cloudfront-setup.md`
  before digital file delivery actually works.

**Testimonials** ✅ (merged from `feature/testimonals`, 2026-06-14)

- API module (controller/service/dto/repo), creator management page, public submission form
  `/c/[username]/testimonial`, reviews tab on public profile

**Dashboard UI consolidation** ✅

- Shared `StatPanel` (one framed panel, hairline-divided cells, tabular-nums, trend deltas)
  on creator dashboard + offers page; `MetricCard` retained for analytics
- Offers page aligned to dashboard/bookings: StatPanel + `FilterChipGroup` + standard
  `p-4 sm:p-6`; `OfferItem` rows de-toyed (no left-accent/ping/primary tile)

**Schema** (migrations 0001–0004 + later `db:push`)

- Tables: schedules, schedule_rules, schedule_overrides, calendar_connections,
  bookings (+ guest name/email/phone, nullable learnerProfileId), testimonials
- Partial unique index: `uq_bookings_active_slot` (race guard)

**API Modules**
| Module | Status |
|---|---|
| OfferingsModule | ✅ CRUD + status state machine |
| AvailabilityModule | ✅ RRULE slots + freebusy + learner-tz |
| CalendarModule | ✅ Google OAuth + AES-256-GCM token + auto-refresh |
| MeetingModule | ✅ Provider abstraction + GoogleMeetProvider |
| PaymentModule | ✅ Razorpay lazy-init + order/verify/webhook/refund |
| BookingsModule | ✅ Full lifecycle: create → confirm → cancel (+ guest) |
| TestimonialsModule | ✅ Submit + visibility toggle + public list |

## Next Up (web layer)

1. Learner booking history
2. Replace remaining mocked learner/dashboard data with real API
3. Availability builder polish (3 base-ui Select edge cases fixed; UX pass pending)

## Open / To Clarify (decide before building)

1. ~~Per-type checkout flow~~ ✅ DONE — 3 types built end-to-end (see Done above).
3. **Creator payouts + KYC** ← **NEXT FOCUS.** Funds currently land in the platform Razorpay
   account, not the creator's. Need: split to creator (Razorpay Route / transfers), creator
   bank + KYC capture, platform-fee % decision, real `(creator)/payouts/page.tsx` UI +
   endpoints (page is mock). Secure + audited (ledger, idempotent, reconciliation).
   **Design doc: `docs/payouts-kyc-routing.md`.**
4. **Auth gaps** — sign-in shows email+password but only Google OAuth works → wire password
   auth or drop the form. Capture phone for creator + learner at signup. Guest checkout:
   verify phone? + sync a guest's prior bookings to their account when they later sign up
   with the same email. Keep guest flow secure/trusted.

## Done

- **Testimonial eligibility (Model C)** — submit now requires login (`AuthGuard` + `@Session`).
  Any signed-in user may review; reviews backed by a confirmed/completed booking get an
  `isVerified` flag → "Verified booking" badge on the public reviews tab. Server-side guards:
  self-review (403), one-per-user-per-creator dup (409, unique index `uq_testimonial_user_creator`).
  `testimonials` gained `user_id` (FK→user, set null) + `is_verified` (applied to Neon directly,
  see migration `0005`). Web: soft login gate via reusable `components/shared/auth-dialog.tsx`
  (Google + email/password), form draft persisted to sessionStorage for the Google round-trip.

5. **Onboarding step-4 (first offering)** — still missing `description` field + lite
   availability per `docs/offerings-bookings-slots-schedulies.md` §10.2
   (`AvailabilityScheduleBuilder showOverrides={false}`, collapsed expander, default
   Mon–Fri 09:00–17:00). Add description + `rules[]` to step-4 schema/mutation.
   We need to assist him to set availability, because we need schedule table and schedule rules table to show the slots in the booking page / profile. (because if he/she forgots to add this thier offerings cannot be booked to the users)

## Blocked / Needs Config

- `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` — empty in API `.env`; web needs `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- Google Console: add callback URI, enable Calendar API

## Key Decisions

- Prices in paise (DB), INR (API)
- Bookings UTC, slots in learner tz — UTC instant is source of truth; `startLocal` is
  display-only; `endLocal` dropped (was unused)
- Toast = shadcn (`@/lib/toast` + `@radix-ui/react-toast`), NEVER sonner
- Booking modal state lives in URL (offering/tz/start/end) for restore
- Shared `StatPanel` for creator stat rows; `MetricCard` kept for analytics
- API host default `localhost` (not 127.0.0.1); `lib/api.ts` tolerates empty 200 bodies
- Razorpay lazy-init commit `9f5c942` — revert if payment breaks
- Learner profile auto-created on first booking
- `parseRoles()` always, never `.split(',')`
