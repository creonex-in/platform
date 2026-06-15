# Offering Types — End-to-End Flow Design

> Status: **design spec** (no code yet). This document defines the complete flow for every
> offering type — how a creator creates it, what data is captured, how a learner discovers
> and pays for it, how it is fulfilled, and the security invariants at each step. It is
> grounded in the existing schema (`apps/api/src/database/schema.ts`) and the live 1:1 flow.
> A separate implementation task will build the gaps listed at the end.

---

## 1. Why this exists

Today only the **1:1 session** path is complete end-to-end:
slot picker → checkout → Razorpay → confirm → Google Meet link.

Everything else is half-wired:
- `group` is bookable through the slot picker but was never conceptually defined.
- `workshop` and `digital` show **"Coming soon"** on the public profile — no booking UI.
- There is **no event-datetime input** for fixed events, and **no digital delivery** at all.
- The canonical enum (`one_on_one, workshop, group, digital`) disagrees with the public
  profile UI, which still references `course` / `digital_product`. (`digital_product` is just
  the old name for `digital`. **`course` is NOT in scope** — see note below.)

> **Courses are explicitly out of scope here.** A full course (modules, lessons, progress
> tracking, drip content, video hosting) is a separate future offering type with its own
> enum value and a large dedicated build. It is **not** a kind of digital product. Wherever
> the old UI says `course`, that's a stray reference to remove/park — do not fold it into
> `digital`.

This doc rationalizes the taxonomy and specifies all types so they can be built consistently.

---

## 2. Taxonomy — 3 types

We model **three** offering types. `workshop` and `group` collapse into a single
`live_event` type: their only real difference (a small interactive cohort of ~6 vs a large
broadcast of 50+) is the **seat count** and presentation — a preset, not a separate flow.

| Type | Label | Real-world scenario | Schedule | Seats | Fulfillment |
|------|-------|---------------------|----------|-------|-------------|
| `one_on_one` | **Session** | Mentoring, code review, consult | Learner picks a slot from creator availability | 1 | Google Meet |
| `live_event` | **Live event** | `format:group` cohort call (2–20) · `format:webinar` masterclass (20–500) | Creator sets ONE fixed datetime | `seatsTotal` | One shared Google Meet / link |
| `digital` | **Digital product** | PDF, template pack, single recording/asset | none (async) | unlimited | File download + external link |

The group-vs-webinar distinction is carried as **`metadata.format: 'group' | 'webinar'`**
(drives label, icon, and the seat preset only). It is **not** a separate enum value, so we
avoid an enum migration if the two ever need to diverge for real (e.g. a webinar-specific
provider or roster management) — at which point we split based on the discriminator.

Canonical enum going forward: **`one_on_one | live_event | digital`**.

A 4th type — **`course`** — is planned for the **future** (its own enum value + a large
dedicated build: modules, lessons, progress, drip, video hosting). It is **not** covered by
this doc and must not be merged into `digital`.

---

## 3. Per-type flows

### 3.1 Session — `one_on_one` (reference flow, already built)

**Creator creates**
- Fields: `title`, `description`, `price`, `durationMinutes`, booking rules
  (`minNoticeMinutes`, `bookingWindowDays`, `bufferAfterMinutes`), and a linked
  `scheduleId` (recurring availability defined separately in `/calendar`).
- Stored on `offerings`; availability lives in `schedules` + `scheduleRules` (rrule) +
  `scheduleOverrides`.

**Learner discovers**
- Public profile (`/c/[username]`) → offerings tab → offering card → **slot picker modal**.
- Slots are computed live by `slot-generation.service.ts` from the rrule + overrides +
  existing bookings + (optionally) the creator's connected Google Calendar free/busy, then
  returned in the learner's timezone (28-day window).

**Learner books & pays**
- Pick slot → `/checkout` → create booking (`POST /bookings` or `/bookings/guest`) →
  Razorpay order → pay → confirm (`/bookings/:id/confirm`, HMAC signature verified) →
  status `confirmed`, Google Meet link created and shown.

**Data**: `booking.startTime` = chosen slot; `endTime` = server-derived from
`durationMinutes`; `amountPaise` = price snapshot; seats = 1.

**Security / invariants**
- Slot is **re-validated server-side** at booking create (client cannot fabricate a time).
- `uq_bookings_active_slot` (offeringId, startTime) where status in
  (`pending_payment`,`confirmed`) prevents double-booking at the DB level.
- Amount is taken from the offering, never from the client.

---

### 3.2 Live event — `live_event` (NEW; covers old group + workshop)

**Creator creates**
- Fields: `title`, `description`, `price`, **`scheduledAt` (one fixed datetime + timezone)**,
  `durationMinutes`, `seatsTotal`, and a **format preset** stored in `metadata.format`:
  - `group` → seat range 2–20 (interactive cohort)
  - `webinar` → seat range 20–500 (broadcast)
- **No** `scheduleId` and **no** slot picker — there is exactly one occurrence.

**Learner discovers**
- Offering card shows the single fixed **date/time** and **"X of N seats left"**
  (sold-out state when `seatsRemaining = 0`).

**Learner books & pays**
- No slot picker. Learner clicks **Register** → `/checkout` → create booking → Razorpay →
  confirm. `booking.startTime = offering.scheduledAt`, `endTime` derived from duration.
- Seat is **atomically decremented** (`seatsRemaining > 0` guard); if the decrement loses a
  race, the booking is cancelled and the learner sees "just sold out".

**Fulfillment**
- **One shared** Google Meet / event link for all registrants — created once (at the first
  confirm, or set by the creator) and surfaced to every `confirmed` booking. If the creator
  has no calendar connected, the link is null and the creator must add one; registrants are
  notified when it's available.

**Security / invariants**
- The concurrency guard is the **atomic seat decrement**, not the slot unique index (all
  registrants share one `startTime`, so that index does not apply here).
- Block new bookings once `scheduledAt` has passed or seats hit zero.
- `seatsTotal` cannot be edited below the number already sold.

**Out of scope (future):** recording access via `metadata.recordingUrl`, gated to registrants.

---

### 3.3 Digital product — `digital` (NEW)

**Creator creates**
- Fields: `title`, `description`, `price`, and a **delivery payload in `metadata`**:
  ```jsonc
  {
    "files": [{ "key": "...", "name": "guide.pdf", "sizeBytes": 1048576 }],
    "externalUrl": "https://...",   // optional
    "instructions": "..."            // optional, shown after purchase
  }
  ```
  Supports **both** uploaded files (S3, see §5) **and** an external link.
- No schedule, no seats (`seatsTotal = null`), no duration.

**Learner discovers**
- Offering card → **"Get access"** (no slot picker, no datetime).

**Learner buys & pays**
- Async "purchase" path: create booking with `startTime = null`, `endTime = null` →
  Razorpay → confirm → status `confirmed` (no Meet creation).

**Fulfillment**
- After confirm, a **gated access endpoint** returns short-lived signed download URLs for
  the files plus the external link — **only** to the buyer (authenticated learner by
  `learnerProfileId`, or guest by a single-use emailed access token).

**Security / invariants**
- The `metadata` delivery payload is **never** exposed on the public profile API.
- File access is gated behind a `confirmed` booking; URLs are signed and short-lived.
- Guest access is a single-use token tied to `guestEmail` (expiry + resend).

---

## 4. Cross-cutting concerns

### 4.1 Data-model mapping (no new columns needed for the 3-type model)

| Concern | `one_on_one` | `live_event` | `digital` |
|---------|--------------|--------------|-----------|
| Time source | `scheduleId` (recurring slots) | `scheduledAt` (one fixed) | none |
| Seats | 1 | `seatsTotal` / `seatsRemaining` | null (unlimited) |
| `metadata` | — | `{ format }` | `{ files, externalUrl, instructions }` |
| `booking.startTime` | chosen slot | = `scheduledAt` | null |
| Meeting | per-booking Meet | one shared link | none |

The only schema change is the **enum value rename** (`workshop`+`group` → `live_event`),
plus backfilling `metadata.format` for existing rows.

### 4.2 Booking status lifecycle

- `one_on_one` & `live_event`: `pending_payment → confirmed → completed` (or `cancelled`).
- `digital`: `pending_payment → confirmed` (no `completed` / `no_show`).

### 4.3 Payment

Identical for all three: Razorpay **order create → signature verify → confirm**. Only the
post-confirm side effect differs — per-booking Meet (1:1), one shared link (live event), or
access grant (digital). Webhook is the backup path if the client confirm is lost.

### 4.4 Security & RBAC matrix

| Action | Who |
|--------|-----|
| Create / edit / delete offering | Creator (ownership enforced in service) |
| Read public profile + slots | Public |
| Create / confirm / cancel booking | Learner **or** guest |
| Read digital delivery payload | Buyer only (gated endpoint) |
| Creator booking list / cancel | Creator (offering ownership) |

### 4.5 Type-gating

With `live_event` replacing workshop/group, the unlock rule applies to it:
- `one_on_one` and `digital` — always available.
- `live_event` — gated behind `SESSIONS_TO_UNLOCK_OFFERS` (5) completed 1:1 sessions.

### 4.6 Naming cleanup

Reconcile enum ↔ UI. Canonical = `one_on_one | live_event | digital`.
- Old `workshop` / `group` → `live_event` (+ `metadata.format`).
- Old UI `digital_product` → `digital`. Old UI `course` → **remove/park** (NOT `digital`);
  it returns as its own enum value in the future course build.
- Touch-points: `packages/types/src/onboarding.ts` (OFFER_TYPES + gating constants),
  `app/c/[username]/_components/types.ts`, `offer-form/index.tsx`, `offering-card.tsx`.

---

## 5. Storage architecture — migrate to AWS S3 + CloudFront

**Why Cloudinary is wrong for digital products.** Today Cloudinary does client-side
*unsigned* image uploads (browser → Cloudinary) for profile/banner only, producing public
CDN URLs by design. Paid digital assets (PDFs, multi-GB video, zips) need **gated,
expiring, access-controlled** delivery and cheap large-file storage. Public unsigned URLs
would let anyone with the link bypass payment.

**Direction: unify ALL storage on S3 + CloudFront** (not a Cloudinary/S3 hybrid).
- Next.js `<Image>` already resizes/optimizes at the app layer, so Cloudinary's main
  value-add (on-the-fly transforms) is largely redundant for us.
- One vendor + one access model (presigned everywhere) is simpler than two systems.
- Paid content must be private anyway — S3 is the correct tool; don't split the system.

**Buckets**
- **Public** (profile photos, banners, offering thumbnails): a *private* bucket exposed only
  via CloudFront with **Origin Access Control (OAC)** — never a public ACL. Content-hash
  keys (e.g. `profiles/{userId}/{hash}.webp`) so the CDN cache busts on replace. `next/image`
  optimizes on serve.
- **Private** (digital product files): no public/CloudFront-public access. Delivered only via
  **presigned GET** (short TTL, 5–15 min) or CloudFront signed cookies, minted by the API
  **only after a confirmed booking** for that offering.

**Uploads — all S3 logic lives in the NestJS API, never the frontend.** The AWS SDK, IAM
credentials, presign signing, bucket keys, and delete logic are **backend-only** (a
`uploads` module in `apps/api`). The frontend never touches S3 SDK or credentials.

Flow:
1. Web calls **our API** (through the normal `services → dal → lib/api` path — no raw fetch)
   to request an upload: e.g. `POST /v1/uploads/presign`.
2. API validates (auth + role; for digital files also creator ownership of the offering),
   then returns a **scoped presigned PUT URL** — key prefix locked to the user,
   `content-length-range`, allowed content-type, short expiry. Buckets/keys/creds stay server-side.
3. Browser does the **single raw PUT to the returned S3 URL** (the file goes straight to S3,
   never through our API server). This direct-to-S3 PUT is the only external call the client
   makes — it is *not* a call to our backend, so it doesn't violate the `lib/api`-only rule.
4. (Optional) Web calls `POST /v1/uploads/confirm` so the API records the final key on the
   profile/offering; deletes go through `DELETE /v1/uploads/:key` (API runs the S3 delete).

Backend endpoints (NestJS): `POST /uploads/presign` (public-bucket images + private digital
files, gated by role/ownership), `POST /uploads/confirm`, `DELETE /uploads/:key`, and the
buyer-gated **download presign** for digital delivery (`GET /bookings/:id/assets` →
short-TTL presigned GETs, only for a confirmed booking).

Web side: delete `apps/web/lib/cloudinary.ts`; add a thin `services/storage.service.ts`
(+ `dal` if server-side) that calls those API routes via `lib/api`. Keep only the
**client-side validators** (`validateImageFile`, `validateBannerFile`) in a small web util —
they're pure file checks, no storage logic.

**Digital uploads — size, progress, orphan handling (treat as first-class).**

*Size*
- Hard cap enforced **server-side** in the presign (`content-length-range`) — the client
  can't lie about size. Also validate client-side first to fail fast before any request.
- Tiered caps by file kind / creator plan (e.g. PDF/zip vs video); reject oversized up front.
- Large files (video, GB-scale) → **S3 multipart upload**: API issues presigned URLs per
  part (`CreateMultipartUpload` → presign parts → `CompleteMultipartUpload`), so a single
  PUT timeout doesn't kill a 2 GB upload.

*Progress & resilience*
- Multipart enables a real **progress bar** (parts completed / total) and **resume** of
  failed parts without restarting the whole file.
- Handle: network drop mid-upload, browser close, user abort → ability to retry/abort
  cleanly. Abort calls `AbortMultipartUpload` so S3 doesn't keep half-uploaded parts billing.

*Orphan states (must be swept, not left to rot)*
- **Uploaded but offering never saved** (creator abandons the draft) → file sits in S3 with
  no DB row pointing at it. Mitigate: upload into a **temp/pending key prefix**
  (`uploads/pending/{userId}/...`); only `confirm` moves/marks it as attached to an offering.
- **Incomplete multipart** (never completed/aborted) → orphaned parts.
- **Replaced file** → old object left behind when a creator swaps the asset.
- Mitigations:
  - **S3 lifecycle rules**: auto-expire objects under `uploads/pending/*` after N days, and
    auto-abort incomplete multipart uploads after N days.
  - **Delete-old-on-replace** in the API when a creator changes a digital file.
  - Optional periodic **reconciliation** job: list bucket vs DB references, delete unreferenced.

**Migration.** Backfill-copy existing Cloudinary images into the public bucket, rewrite
`creatorProfiles.profilePhotoUrl` / `coverBannerUrl` to CloudFront URLs, dual-read (accept
old Cloudinary URLs) during transition, then update `next.config.ts` remote patterns (add
CloudFront host, drop Cloudinary) and the call sites (onboarding step-2/3, edit-profile,
banner-picker).

**Infra to provision (build task):** S3 public + private buckets, CloudFront + OAC, IAM for
presign, optional virus scan on private uploads.

---

## 6. Edge cases & failure modes

**Booking / payment / concurrency**
- Slot or seat taken between display and pay → graceful "just taken" UX (DB unique index +
  atomic seat decrement are the guards).
- Abandoned `pending_payment` holds blocking slots/seats → **TTL sweep** (expire ~15 min)
  that releases the slot and restores the seat.
- Payment captured but the confirm call is lost → idempotent confirm + Razorpay **webhook**
  backup (process only if still `pending_payment`); never double-confirm.
- Seat decremented but Razorpay order create fails → restore the seat (compensating action).
- Refunds: full vs partial, cancellation window (e.g. free if >24h before), who initiated.
- Creator cancels a `live_event` with N paid registrants → bulk refund + notify all.
- Offering edited after bookings exist → amount protected by per-booking price snapshot;
  `seatsTotal` can't drop below seats sold; duration change affects future only.
- `scheduledAt` already passed / event sold out → block new bookings.
- Very large `live_event` (500 seats) → seat-counter contention; counter column vs row-per-seat.

**Timezones / scheduling**
- DST transitions in the booking window; creator changes schedule timezone after bookings
  exist; learner-tz display vs stored UTC; min-notice / window boundary slots.
- Buffer overlap when multiple offerings share one schedule.
- Calendar not connected → Meet link null; creator must add one and registrants are notified.

**Digital products / storage**
- Multi-GB video → multipart upload, progress, timeouts.
- Orphaned uploads not attached to an offering → S3 lifecycle cleanup.
- File replaced after purchase (versioning — do buyers get latest?); external link rot.
- Access after **refund** → keep presigned TTL short so revocation is effectively immediate.
- Signed-URL resharing / hotlinking → short TTL (watermarking out of scope).
- Malicious / infringing uploads → virus scan + content-type allowlist + size caps; DMCA path.
- Free digital (price 0) vs the current ₹99 minimum — decide.

**Guest flows**
- Same guest email books twice; guest later creates an account → link past bookings by email.
- Guest digital purchase access via single-use **email token** (expiry, resend, lost-email).

**Security / abuse**
- IDOR on the digital-access endpoint → verify booking ownership (learner id or guest token).
- Presigned-upload abuse → lock key prefix per user, `content-length-range`, content-type,
  short expiry.
- Never expose the `metadata` delivery payload on the public profile API.
- Price tampering → server always uses the offering price snapshot, ignores client amount.
- Razorpay webhook → verify the signature on the **raw** body.
- Public bucket misconfig → private bucket + CloudFront OAC, never a public ACL.

---

## 7. Build backlog (for the implementation task)

1. **Enum migration** — `workshop`+`group` → `live_event`; backfill `metadata.format`.
2. **Offer form** — fixed-event datetime + format preset input for `live_event`; digital
   delivery editor (file upload + external link); type-specific field gating.
3. **Live-event booking** — register (no-slot) branch in checkout + `bookings.service`;
   sold-out / seats UI on the offering card.
4. **Digital purchase** — async (no-slot) booking path; gated access endpoint
   (signed URLs + guest token); post-purchase access page.
5. **Storage** — migrate to S3 + CloudFront. **Backend-owned** `uploads` module in
   `apps/api` (AWS SDK + IAM + presign + delete; public + private buckets, OAC); web only
   calls API routes via `lib/api` (delete `lib/cloudinary.ts`, add `storage.service.ts`).
   Backfill Cloudinary → S3; update `next.config.ts` hosts.
6. **Reliability** — `pending_payment` TTL sweep; refund / cancellation policy; orphaned-upload
   + virus-scan lifecycle.
7. **Naming** — `digital_product` → `digital`; **remove/park stray `course` references**
   (course is a future separate type, not part of this work).
