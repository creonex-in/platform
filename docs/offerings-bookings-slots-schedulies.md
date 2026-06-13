# Creonex — Scheduling & Booking Architecture

Calendly-style scheduling for Offerings · Availability · Slots · Bookings ·
Calendar/Meet. Stack: Better Auth + NestJS 11 + Drizzle/Neon + Next.js 16.

Times-of-day stored **local to a schedule's timezone**; bookings stored **UTC**;
slots returned in **learner's timezone**. Meeting URL is **per-booking, dynamic**.

---

## 0. How it works (mental model + scenario walkthrough)

### The core idea — slots are computed, not stored

A creator **never creates individual slots by hand.** Manually making "9:00,
9:30, 10:00…" for every day forever is impossible. Instead the creator sets
**two things once:**

1. **A rule** — "available every Mon/Wed/Fri, 09:00–13:00" (repeats forever via RRULE).
2. **A duration** — "each 1:1 session is 30 min."

The system **calculates slots on the fly** from rule + duration whenever a learner
looks. Slots are **not** a database table — they are a live math result: take the
rule's window (09:00–13:00), chop into 30-min pieces → 9:00, 9:30, 10:00 … 12:30;
subtract booked + busy times; show the rest.

> Group/workshop offerings skip slot math entirely — one fixed `scheduled_at` +
> a seat counter. Only `one_on_one` uses schedules and slot generation.

### Cast
- **Asha** — creator, teaches DSA, timezone `Asia/Kolkata`.
- **Ravi** — learner, wants a 1:1 session.

### PART A — Asha sets up (creator side)

**Page `/creator/calendar` — Connect Google Calendar.** One button → Google OAuth
consent → tokens stored in `calendar_connections`. Purpose: (a) read her busy
times so booked/personal hours aren't offered, (b) auto-create a Meet link per
booking. Optional — without it bookings still work (manual link, no busy-block).

**Page `/creator/availability` — Schedule builder.** Calendly-style weekly grid:
```
Timezone: [Asia/Kolkata ▼]
  Mon  09:00 – 13:00  ✓      Tue  off
  Wed  09:00 – 13:00  ✓      Thu  off
  Fri  09:00 – 13:00  ✓      Sat  10:00 – 12:00  ✓     Sun  off
```
Saved as schedule "Working Hours" with rules:
`FREQ=WEEKLY;BYDAY=MO,WE,FR → 09:00–13:00` and `BYDAY=SA → 10:00–12:00`.
Overrides via a date widget: July 15 → **blocked** (traveling); July 18 →
**custom 14:00–17:00**. Schedule is reusable across offerings.

**Page `/creator/offerings/new` — create offering.**
```
Type: 1:1 Session   Title: "DSA Doubt Clearing"   Price: ₹500
Duration: 30 min     Buffer: 10 min     Schedule: Working Hours
Min notice: 2 hours  Book up to: 30 days ahead
```
Publish → status `draft → live` → discoverable. Asha set rule + duration once;
she never touches individual slots.

### PART B — Ravi books (learner side)

**Page `/c/asha` (or `/offerings/:id`) — offering page.** Price, duration,
**"Book a slot"** button.

**Slot picker — the live calculation.** Ravi picks Wed, July 16. Frontend calls:
```
GET /api/offerings/:id/slots?from=2026-07-16&to=2026-07-16&timezone=Asia/Kolkata
```
`SlotGenerationService` runs (see §5): rule says Wed 09:00–13:00 → no override →
chop into 30+10-min steps → drop past → drop booked (10:20 taken) → drop
Google-busy (Asha has a meeting 11:00–12:00) → convert to Ravi's tz. Ravi sees:
```
Wed, July 16
  ○ 9:00 AM      ○ 9:40 AM
  ✗ 10:20 (booked)   ✗ 11:00 (Asha busy)   ○ 12:20 PM
```
He clicks **9:40 AM**.

> Timezone: if Ravi were in London the same slot shows as **5:10 AM** — same
> instant, different clock. Booking stored in UTC so there's no ambiguity.

**Checkout.** Frontend calls:
```
POST /api/bookings  { offeringId, slotStart:"2026-07-16T04:10:00Z", topic }
```
Server re-checks 9:40 is still free (race guard), creates Razorpay order, marks
booking `pending_payment`, opens checkout. Ravi pays.

**Confirmation.** `POST /api/bookings/:id/confirm` → verify signature → booking
`confirmed` → background job creates Google Meet on Asha's calendar → saves
`meeting_url`. Ravi sees the booking + **Join Google Meet** link; both calendars
get the event.

### Answers to the two common confusions
- **Where does a creator connect a calendar?** `/creator/calendar`, one button,
  Google OAuth, once. Used for hiding busy times + auto Meet links.
- **How does slot management work?** Creator sets a repeating rule (days + hours)
  + duration, once. System computes bookable slots live as `rule − booked − busy`
  every time a learner opens a date. No slot table, no manual entry.

### Terminology

How the terms stack:
```
Schedule  → has many → Rules       (the repeating pattern)
Schedule  → has many → Overrides   (one-off exceptions to the pattern)
Offering  → points to → Schedule
Slots     = computed live from  Rules − Overrides − Bookings − Busy
Booking   = one learner claiming one slot
```

| Term | Meaning | Example (Asha, `Asia/Kolkata`) |
|---|---|---|
| **Schedule** | Named, reusable set of working hours; carries the anchor **timezone**. | "Working Hours", tz Asia/Kolkata |
| **Rule** | A repeating pattern inside a schedule: RRULE + time window. Repeats forever unless bounded. | Mon/Wed/Fri 09:00–13:00 |
| **RRULE** | Recurrence text (RFC 5545). Expresses patterns a plain weekday can't. | `FREQ=WEEKLY;INTERVAL=2;BYDAY=MO` (every 2nd Monday) |
| **Window** | The start–end hours of a rule/override, stored **local** to the schedule tz. | `09:00–13:00` |
| **Override** | One-date exception that beats the rule. `blocked` = day off; `custom` = different hours. | Jul 15 blocked; Jul 18 custom 14:00–17:00 |
| **Slot** | One bookable block. **Computed, never stored** = window chopped by `duration+buffer`. | 9:00–9:30, 9:40–10:10, … |
| **Duration** | Session length (on the offering). Sets slot length. | 30 min |
| **Buffer** | Rest gap after each session; added to the step between slot starts. | 10 min → starts every 40 min |
| **Min notice** | Can't book a slot closer than this lead time. | 2 hours |
| **Booking window** | How far ahead slots are offered (also caps compute). | 30 days |
| **Creator tz** | Schedule anchor; hours defined here. | 09:00 = 9 AM IST |
| **Learner tz** | What the learner sees; same instant, different clock. | London learner sees 03:30 GMT |
| **UTC** | Neutral storage for bookings — no "whose clock" disputes. | stored `03:30Z` |
| **Freebusy / busy block** | Creator's real external-calendar commitments; overlapping slots are removed. | dentist 11:00–12:00 → those slots gone |
| **Booking** | A learner claiming one slot + payment; has a status. | see `booking_status` enum |
| **Slot generation** | The live calc: `Rules − Overrides − Booked − Busy − Past/min-notice → learner tz`. | see §5 |

RRULE quick reference:

| Want | RRULE |
|---|---|
| Every weekday | `FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR` |
| Every 2 weeks on Monday | `FREQ=WEEKLY;INTERVAL=2;BYDAY=MO` |
| 1st Monday of each month | `FREQ=MONTHLY;BYDAY=1MO` |
| Daily, 10 times only | `FREQ=DAILY;COUNT=10` |
| Weekly until a date | `FREQ=WEEKLY;UNTIL=20261231` |

---

## 1. Scheduling stack

```bash
pnpm --filter @creonex/api add date-fns date-fns-tz rrule googleapis
```

| Lib | Used for |
|---|---|
| **date-fns** | slot/interval math, splitting windows by duration+buffer, validation |
| **date-fns-tz** | `fromZonedTime` (local→UTC), `toZonedTime` (UTC→local), `formatInTimeZone` |
| **rrule** | expand recurring availability (`RRule`, `rrulestr`, `.between()`) |
| **googleapis** | Google OAuth, Calendar event CRUD, freebusy, Meet creation |

---

## 2. Database

### 2.1 `offerings` — the universal core (table already live)

`offerings` is the **shared core** for every sellable type — the thing that has a
price, status, is discoverable + reviewable. Type-specific *structure* lives in
**per-type detail tables** added when that feature is built, NOT as ever-more
nullable columns:

```
offerings (core)
  ├── schedule_id        → one_on_one   (added below, now)
  ├── scheduled_at/seats → group/workshop (exists, now)
  ├── digital_products   → digital   (FK→offerings, BUILD LATER)
  └── courses → course_sections → course_lessons  (FK→offerings, BUILD LATER)
```
Rule: scheduling family shares the flat columns; courses/digital get real tables
when built (a course is a tree — never columns on `offerings`).

```
ADD (migration 0003):
  + schedule_id          uuid FK → schedules.id (nullable; 1:1/recurring)
  + min_notice_minutes   int default 120   (no booking inside this lead time)
  + booking_window_days  int default 30    (how far ahead slots are offered)
  + buffer_after_minutes int default 0     (gap after each 1:1 slot)
  + min_participants     int               (group go/no-go threshold)
  + slug                 text unique       (SEO URL, all types)
  + metadata             jsonb default '{}' (small type-specific fields w/o a migration each time)
DO NOT add meeting_link — meeting URL lives per-booking.
```

### 2.2 `schedules` — reusable creator availability (NEW)

```
id, creator_profile_id FK → creator_profiles.id (cascade)
name        text   'Working Hours'
timezone    text   IANA, e.g. 'Asia/Kolkata'   ← creator anchor tz
is_default  bool
created_at, updated_at        index (creator_profile_id)
```

### 2.3 `schedule_rules` + `schedule_overrides` (NEW)

```
schedule_rules                      -- recurring windows
  id, schedule_id FK (cascade)
  rrule       text   'FREQ=WEEKLY;BYDAY=MO,WE,FR'
  start_time  text   'HH:MM'  (LOCAL to schedule.timezone)
  end_time    text   'HH:MM'  (LOCAL)
  created_at                        index (schedule_id)

schedule_overrides                  -- date-specific exceptions
  id, schedule_id FK (cascade)
  date        date   'YYYY-MM-DD' (schedule.timezone)
  type        override_type 'blocked' | 'custom'
  start_time  text NULL   'HH:MM' (custom only)
  end_time    text NULL   'HH:MM' (custom only)
  created_at                        unique (schedule_id, date)
```

Recurrence (which days) → `rrule`; time-of-day → `start_time`/`end_time`.
Supports weekly/monthly/every-N-weeks, `COUNT`/`UNTIL`, blocked + custom dates.

### 2.4 `bookings` (NEW)

```
id, offering_id FK, learner_profile_id FK
start_time / end_time   timestamptz UTC  (null for digital)
status                  booking_status
amount_paise            int    (price snapshot)
creator_timezone        text
learner_timezone        text
meeting_provider        text NULL  'google_meet' | 'zoom' | 'teams'
meeting_url             text NULL  (created on confirm)
calendar_event_id       text NULL  (external event id)
razorpay_order_id / razorpay_payment_id  text NULL
waitlist_position       int NULL   (group only)
topic                   text NULL  (1:1 only)
cancelled_at, cancelled_by ('learner'|'creator'|'system'), cancellation_reason
created_at, updated_at
index (offering_id), (learner_profile_id), (start_time)
partial unique (offering_id, start_time) WHERE status IN ('pending_payment','confirmed')
```

### 2.5 `calendar_connections` — creator external calendar (NEW)

```
id, creator_profile_id FK (cascade)
provider          text  'google'
account_email     text
access_token      text  ENCRYPTED at rest
refresh_token     text  ENCRYPTED at rest
token_expires_at  timestamptz
calendar_id       text default 'primary'
sync_enabled      bool default true
created_at, updated_at        unique (creator_profile_id, provider)
```

### 2.6 New enums

```
booking_status : pending_payment | confirmed | cancelled | completed | refunded | no_show
override_type  : blocked | custom
```

---

## 3. Availability model

Creator builds reusable **schedules** (named, tz-anchored). Each holds N recurring
**rules** (RRULE + local time window) + date **overrides** (blocked/custom). A
`one_on_one` offering references a schedule; group/workshop use fixed `scheduled_at`.

Example — schedule "Weekday mornings", tz `Asia/Kolkata`:
```
rule 1  FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR   09:00–13:00
rule 2  FREQ=WEEKLY;BYDAY=SA               10:00–12:00
override 2026-07-15  blocked
override 2026-07-18  custom 14:00–17:00
```

---

## 4. Timezone rules

1. Bookings stored UTC (`timestamptz`). Never store local booking times.
2. Schedule carries creator anchor tz (`schedules.timezone`, IANA).
3. Generate in creator tz, then normalize to UTC:
   ```ts
   const localStart = `${format(D,'yyyy-MM-dd')}T${rule.start_time}:00`;
   const utcStart   = fromZonedTime(localStart, schedule.timezone);
   ```
4. Slots returned in learner tz — API takes `?timezone=Asia/Kolkata`, convert with
   `toZonedTime` / `formatInTimeZone`.
5. Snapshot both `creator_timezone` + `learner_timezone` on booking.
6. DST-correct by construction — `fromZonedTime`/`toZonedTime` resolve offset per date.

---

## 5. Slot generation

`SlotGenerationService.generate({ offeringId, fromDate, toDate, learnerTimezone })`:

```
1. Load offering (+schedule, +rules, +overrides). Offering must be 'live'.
2. Clamp range to [now + min_notice_minutes, now + booking_window_days].
3. For each rule:
     occurrences = rrulestr(rule.rrule).between(fromDate, toDate, inc=true)
     for each occurrence date D:
       apply override:  blocked → skip;  custom → replace window
       utcStart = fromZonedTime(`${D}T${start_time}`, schedule.tz)
       utcEnd   = fromZonedTime(`${D}T${end_time}`,   schedule.tz)
4. Split each UTC window into (duration_minutes + buffer_after_minutes) slots (date-fns).
5. Drop slots before now + min_notice_minutes.
6. Drop slots overlapping bookings (status IN pending_payment, confirmed).
7. Drop slots overlapping Google freebusy busy blocks (skip if calendar not connected).
8. Convert remaining UTC slots to learnerTimezone.
RETURN [{ startUtc, endUtc, startLocal, endLocal }]
```

Clamp expansion to `booking_window_days` (never unbounded); one freebusy call per
request; booked-slot query = single indexed range scan on `start_time`.

---

## 6. Google Meet flow (dynamic, per booking)

```
Booking created (pending_payment)
  → Razorpay confirmed (signature verified)
  → [post-payment job — do NOT block confirm on Google]
  → MeetingService.create(booking)  → GoogleMeetProvider.createMeeting():
       calendar.events.insert({ conferenceDataVersion:1, requestBody:{
         start:{dateTime:startUtc,timeZone:'UTC'}, end:{dateTime:endUtc,timeZone:'UTC'},
         attendees:[creator,learner],
         conferenceData:{ createRequest:{ requestId, conferenceSolutionKey:{type:'hangoutsMeet'} } } }})
  → receive event.id + hangoutLink
  → persist booking.calendar_event_id, meeting_url, meeting_provider='google_meet'
```

No calendar connection → fall back to manual link field or no-meet. Never block payment.

---

## 7. Meeting provider abstraction

Booking flow depends on an interface, never on `googleapis` directly.

```ts
export interface CreateMeetingInput {
  bookingId: string; title: string; startUtc: Date; endUtc: Date;
  organizerEmail: string; attendeeEmails: string[];
}
export interface MeetingResult {
  provider: 'google_meet' | 'zoom' | 'teams';
  meetingUrl: string; externalEventId: string;
}
export interface MeetingProvider {
  readonly key: MeetingResult['provider'];
  createMeeting(input: CreateMeetingInput): Promise<MeetingResult>;
  cancelMeeting(externalEventId: string): Promise<void>;
}
```

`MeetingService` resolves provider per creator (DI token map). Swapping = config change.

---

## 8. NestJS modules

| Module | `apps/api/src/` | Responsibility |
|---|---|---|
| `OfferingsModule` | `offerings/` | CRUD + status state machine (reuse existing repo) |
| `AvailabilityModule` | `availability/` | schedules, rules, overrides; `SlotGenerationService` |
| `CalendarIntegrationModule` | `calendar/` | Google OAuth, token refresh, event CRUD, freebusy |
| `MeetingModule` | `meeting/` | `MeetingProvider` abstraction + `MeetingService` |
| `PaymentModule` | `payment/` | Razorpay order, HMAC verify, webhook, refund |
| `BookingsModule` | `bookings/` | create → order → confirm → cancel; orchestrates Payment + Meeting |

Deps: Bookings → (Payment, Meeting); Meeting → CalendarIntegration; Availability →
CalendarIntegration (freebusy). No cycles.

---

## 9. API endpoints (prefix `/api`)

```
Offerings   POST /offerings · GET /offerings · GET /offerings/mine
            GET /offerings/:id · PATCH /offerings/:id · PATCH /offerings/:id/status
Schedules   POST /schedules · GET /schedules/mine · PATCH /schedules/:id · DELETE /schedules/:id
            PUT /schedules/:id/rules
            POST /schedules/:id/overrides · DELETE /schedules/:id/overrides/:overrideId
Slots       GET /offerings/:id/slots?from=&to=&timezone=Asia/Kolkata
Calendar    GET /calendar/google/connect · GET /calendar/google/callback
            DELETE /calendar/google · GET /calendar/status
Bookings    POST /bookings · POST /bookings/:id/confirm
            GET /bookings/mine · GET /bookings/creator · GET /bookings/:id
            POST /bookings/:id/cancel · POST /bookings/razorpay-webhook
```

Booking: `POST /bookings` (re-validate slot → Razorpay order → `pending_payment`) →
checkout → `POST /bookings/:id/confirm` (HMAC verify → `confirmed` → enqueue Meet).
Group: atomic `UPDATE offerings SET seats_remaining-1 WHERE seats_remaining>0`.

---

## 10. Web (per architecture.md)

```
page/component → services/{offerings,schedules,bookings,calendar}.service.ts
              → dal/*.dal.ts (cookies().toString()) → lib/api.ts (only raw fetch)
```
- Creator: schedule builder (recurrence UI), connect Google Calendar, offering CRUD.
- Learner: discover → slot picker (browser tz) → Razorpay checkout → confirm → Meet link.
- Gate server components with `requireCreator` / `requireLearner`.

### 10.1 Reusable `AvailabilityScheduleBuilder` (one component, two mounts)

Build the weekly-grid availability UI **once** as a controlled, presentational
component; mount it in both onboarding and the dashboard. No duplicated grid logic.

```
components/scheduling/availability-schedule-builder.tsx
  props: {
    value: { timezone: string; rules: Rule[]; overrides?: Override[] }
    onChange: (next) => void
    showOverrides?: boolean      // false in onboarding, true on dedicated page
  }
  Rule = { days: Weekday[]; startTime: 'HH:MM'; endTime: 'HH:MM' }  // → RRULE server-side
```
- Built from existing shadcn primitives (Button, Label, Input, Switch) — only the
  grid layout is new; no new design system.
- Emits a plain payload; the server turns `{ days, startTime, endTime }` into a
  `schedule_rules.rrule` (`FREQ=WEEKLY;BYDAY=…`).

**Mount A — `/creator/availability` (full):** grid + overrides (`showOverrides`) +
Google Calendar connect card. Primary management surface.

**Mount B — onboarding `step-4` (lite):** grid only (`showOverrides={false}`),
**prefilled default** Mon–Fri 09:00–17:00 in the creator's detected timezone,
**collapsed** behind a "Customize availability" expander. Go-Live works untouched.

### 10.2 Onboarding step-4 enhancement (`app/onboarding/creator/step-4`)

Currently saves only `{ title, price, durationMinutes }`. Add scheduling inline
**without bloating the step**:

- Add `<AvailabilityScheduleBuilder showOverrides={false}>` inside a collapsed
  "Customize availability" section, seeded with the default schedule.
- Add a dismissible **"Connect Google Calendar — now or later"** card. Optional;
  **never blocks Go-Live**. Real connect UX lives on `/creator/availability`.
- Extend `creatorStep4Schema` + `useSaveCreatorStep4` to carry `timezone` + `rules[]`.

**One-transaction submit** (schedules are creator-level, offering holds `schedule_id`):
```
POST /api/onboarding/creator/step-4   { title, price, durationMinutes, timezone, rules[] }
  → server tx: insert schedule (+ rules) → insert offering with schedule_id → status='live'
```
Google Calendar connect is a **separate OAuth flow** (`/api/calendar/google/connect`),
never part of this transaction — connect before/during/after; slot generation just
checks "is a connection present?" at query time.

**Decisions locked:** onboarding = lite grid + expander (no overrides); calendar
connect = optional CTA that never blocks. Overrides/exceptions are post-launch,
dedicated-page only.

---

## 11. Migration `0003` (one comprehensive)

1. Enums `booking_status`, `override_type`.
2. Tables `schedules`, `schedule_rules`, `schedule_overrides`, `calendar_connections`, `bookings`.
3. Alter `offerings`: add `schedule_id`, `min_notice_minutes`, `booking_window_days`,
   `buffer_after_minutes`, `min_participants`.
4. Partial unique index on `bookings`. Keep `start_time`/`end_time` as `timestamptz`.
5. Do **not** add `meeting_link`.

`pnpm --filter @creonex/api db:generate` → review SQL → `db:migrate`.

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| Meet creation fails after payment | Confirm first; create Meet in retried job; refund only on permanent fail |
| OAuth token storage | Encrypt tokens at rest; refresh before expiry; handle revocation |
| Google rate limit / latency | Cache freebusy per request; if it fails, skip step 7 (don't fail listing) |
| RRULE + DST | Expand in schedule tz then convert via date-fns-tz; test across a DST boundary |
| Unbounded RRULE expansion | Hard-clamp to `booking_window_days` |
| Double-booking races | `SELECT FOR UPDATE` + partial unique index; atomic seat decrement |
| Webhook vs client confirm dup | Idempotent confirm keyed on `razorpay_payment_id` |
| Pending-payment squatting | Cron cancels `pending_payment` > 10 min → free slot |

---

## 13. Build order

1. Migration `0003` — enums + 5 tables + offering columns + index.
2. `OfferingsModule` — extract from `users/` repo; CRUD + status machine.
3. `AvailabilityModule` + `SlotGenerationService` (date-fns + date-fns-tz + rrule).
4. `CalendarIntegrationModule` — Google OAuth + freebusy → wire into slot gen.
5. `MeetingModule` — `MeetingProvider` + `GoogleMeetProvider` + `MeetingService`.
6. `PaymentModule` — Razorpay order/verify/webhook/refund.
7. `BookingsModule` — create → order → confirm → enqueue Meet → cancel; races.
8. Web — `AvailabilityScheduleBuilder` (reusable) → mount in `/creator/availability`
   (full) + onboarding `step-4` (lite + expander); calendar connect, slot picker,
   checkout, booking views. Extend step-4 schema/mutation for `timezone` + `rules`.

---

## 14. Environment variables

```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
GOOGLE_CALENDAR_CLIENT_ID=...
GOOGLE_CALENDAR_CLIENT_SECRET=...
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/calendar/google/callback
GOOGLE_OAUTH_SCOPES=https://www.googleapis.com/auth/calendar.events
CALENDAR_TOKEN_ENC_KEY=base64-32-byte-key
```

Calendar OAuth is separate from Better Auth Google sign-in (different scopes/consent).
