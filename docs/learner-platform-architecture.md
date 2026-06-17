# Creonex Learner Platform — Architecture & Design

> Status: **spec for review**. This document defines the learner experience end-to-end —
> information architecture, routes, endpoints, schema, flows, design system, and wireframes.
> Implementation follows in phases once approved.

## Why this exists

The learner area today is four placeholder pages (`/learner/{dashboard,schedule,library,account}`)
backed entirely by mock data (`dal/learner.dal.ts`). The layout and `LearnerHeader` are built;
nothing else is. This doc turns that shell into a calm, focused **learning workspace** — not an
admin dashboard — reusing the existing marketplace backend and adding only a lean set of new
tables.

**Design intent:** when a learner enters, it should feel like *"this is my learning space"* — a
personal productivity tool — not *"this is my dashboard."* Clean, minimal, calm, focused; pastel
and neutral, not flooded with brand blue; first-class light **and** dark.

---

## 1. Product reality (design to this)

Creonex is a two-sided marketplace. A learner **discovers creators → books/buys an offering →
pays (Razorpay) → consumes it**. There are exactly **three offer types** — there is **no course /
curriculum / lesson entity**:

| Offer type | What it is | How a learner consumes it |
|------------|-----------|---------------------------|
| `one_on_one` | 1:1 session | Pick a slot → pay → join Google Meet at time |
| `live_event` | Fixed-time group call / webinar (`metadata.format` = `group \| webinar`) | Reserve seat → pay → join Meet at the set time |
| `digital` | Downloadable product | Pay → download files / open external URL |

Learner-facing vocabulary used throughout the UI:
- **Sessions** = `one_on_one`
- **Workshops & events** = `live_event`
- **Digital products** = `digital`
- **Library** = digital purchases + saved items + notes
- **Schedule** = `one_on_one` + `live_event` bookings

"Course", "progress %", and "certificate" language is **deferred** — shown only as a clearly
labeled placeholder until a content model exists.

---

## 2. Information Architecture

One workspace rooted at **`/learner`** ("My Learning"). Each section is a destination inside one
cohesive space; cross-cutting actions are **overlays** (drawers / sheets / command palette), not
separate pages. No admin sidebar.

```
/learner  ……………… Home (the hub)
  • Next up        — next confirmed session + Join CTA
  • Continue       — recently purchased digital products
  • Your goals     — compact snapshot
  • Recommended    — creators matched to goal/niche
  • Quick actions  — Explore, ⌘K

/learner/schedule  … Upcoming + past sessions/events (calendar + list), manage/cancel/join
/learner/library   … Digital purchases · Downloads · Saved · Notes (segmented)
/learner/growth    … Learning goals (v1); progress + certificates placeholders (later)
/learner/account   … Profile, goal/interests, preferences, theme

Overlays (URL-param driven — Back button works, shareable):
  ⌘K  command palette   — jump to any section / search creators / quick actions
  ?session=<id>         — session detail drawer (join link, reschedule, cancel, notes)
  ?note=<id|new>        — note editor sheet
  contextual panels     — save/unsave, quick goal add

Shared discovery (already built): /explore · /top-creators · /c/[username] + booking flow
```

**Navigation hierarchy:** Home is primary. Schedule / Library / Growth are peers in the header.
Account + theme live in the profile menu. ⌘K spans everything. The existing `LearnerHeader` is
extended with these destinations and a ⌘K trigger — no new chrome.

### Responsive navigation (desktop vs mobile)

⌘K is a desktop keyboard accelerator — mobile has no keyboard, so it needs visible tap targets.
One `Command` component, two entry points; one nav model, two presentations.

| Concern | Desktop (≥ md) | Mobile (< md) |
|---------|----------------|----------------|
| Primary nav | Header links: Home · Schedule · Library · Growth | **Bottom tab bar** (fixed, thumb-reachable): Home · Schedule · Library · Growth |
| Command palette | `⌘K` / `Ctrl+K` shortcut opens centered Dialog | **Search/⌘K icon in header** → opens the palette as a **full-screen Sheet** with an on-screen search input (keyboard pops) |
| Account + theme | Profile dropdown in header | Profile dropdown in header (or a "More" tab) |
| Overlays (session detail, note editor) | Side Drawer / centered Sheet | **Full-screen Sheet** |

Details:
- **Bottom tab bar** — new `LearnerTabBar` component, `fixed bottom-0 inset-x-0 md:hidden`, 4 items
  with Font Awesome icons + active state from `usePathname()`; respects safe-area inset
  (`pb-[env(safe-area-inset-bottom)]`). Page content gets bottom padding on mobile so the bar never
  overlaps. Gives the app-like, productivity-tool feel without a sidebar.
- **Palette trigger** — the header shows a `⌘K` pill on desktop and a search/command icon button on
  mobile; both call the same `openCommandPalette()`. The palette is the primary "jump anywhere +
  search creators + quick actions" surface on every screen.
- **No bottom bar on desktop**, no floating ⌘K pill on mobile — each platform shows only its idiom.

---

## 3. Routes

| Route | Purpose | Primary data |
|-------|---------|--------------|
| `/learner` | Workspace home / hub | `GET /bookings/me` (next + recent), goals, saved, learner-profile |
| `/learner/schedule` | Upcoming/past sessions, calendar + list, cancel/join | `GET /bookings/me`, cancel |
| `/learner/library` | Digital purchases + downloads + saved + notes | bookings/me (digital), saved, notes |
| `/learner/growth` | Learning goals (v1); progress/cert placeholders | goals |
| `/learner/account` | Profile, goal/interests, preferences, theme | learner-profile (+ PATCH) |

- `/learner/dashboard` → redirect to `/learner` (home becomes the hub).
- All routes live under `app/learner/layout.tsx`, which already runs `requireLearner()` and renders
  `LearnerHeader`. The layout wrapper gains the `theme-learner` class and mounts the command palette.

---

## 4. API endpoints

### Reuse (already real — no work)

| Method | Path | Use |
|--------|------|-----|
| `GET` | `/v1/bookings/me` | Learner's bookings (sessions, events, digital) |
| `POST` | `/v1/bookings` | Create booking + Razorpay order |
| `POST` | `/v1/bookings/:id/confirm` | Verify payment → confirm → meet link |
| `POST` | `/v1/bookings/:id/cancel` | Cancel + refund |
| `GET` | `/v1/users/me/learner-profile` | Goal + interested niches |
| `GET` | `/v1/availability/offerings/:id/slots` | Slot picker |
| `GET` | `/v1/uploads/digital/:bookingId` | Download links for digital purchase |
| `GET` | `/v1/creators/:username` | Public creator profile + offerings |
| `POST` | `/v1/testimonials/submit/:username` | Leave a review |

### New (v1, lean) — NestJS `learner` module, all `@Roles('learner')`

| Method | Path | Purpose |
|--------|------|---------|
| `PATCH` | `/v1/users/me/learner-profile` | Edit goalType + interestedNiches |
| `GET` `POST` `DELETE` | `/v1/learner/saved` (+ `/:id`) | Save / unsave creators & offerings |
| `GET` `POST` `PATCH` `DELETE` | `/v1/learner/notes` (+ `/:id`) | Personal notes (optionally linked to a booking/offering) |
| `GET` `POST` `PATCH` `DELETE` | `/v1/learner/goals` (+ `/:id`) | Learning goals |
| `GET` | `/v1/learner/overview` | Aggregate for Home (next session, counts, recent) — optional, avoids N round-trips |

All follow the project flow: controller (DTO-validated, `@Roles`) → service → repository → Drizzle;
errors via the normalized envelope.

---

## 5. Database additions

`apps/api/src/database/schema.ts`. Three light tables, each FK → `learnerProfiles.id`
(`onDelete: 'cascade'`), indexed by learner.

```
learner_saved
  id            text pk
  learnerProfileId  text  → learner_profiles.id (cascade)
  targetType    text  ('creator' | 'offering')
  targetId      text
  createdAt     timestamptz
  UNIQUE (learnerProfileId, targetType, targetId)

learner_notes
  id            text pk
  learnerProfileId  text  → learner_profiles.id (cascade)
  bookingId     text? → bookings.id (set null)
  offeringId    text? → offerings.id (set null)
  title         text
  content       text
  createdAt / updatedAt  timestamptz

learner_goals
  id            text pk
  learnerProfileId  text  → learner_profiles.id (cascade)
  title         text
  targetDate    date?
  status        learner_goal_status  ('active' | 'done' | 'archived')  default 'active'
  createdAt / updatedAt  timestamptz
```

New pgEnum `learner_goal_status`. Migration via `db:generate` → `db:migrate`.

---

## 6. Shared types

`packages/types/src/api.ts`: `LearnerSavedItem`, `LearnerNote`, `LearnerGoal`,
`UpdateLearnerProfileRequest`, `LearnerOverview`. Goal-status enum in `onboarding.ts`.
**Rebuild after editing:** `pnpm --filter @creonex/types build` (web/api import the built `dist`).

---

## 7. Web data layer (established pattern, no raw fetch)

```
page / component → services/learner.service.ts → dal/learner.dal.ts → lib/api.ts → API   (server reads)
client mutation  → hooks/use-learner.ts (React Query) → services/learner.service.ts → lib/api.ts
```

- `services/learner.service.ts` — saved / notes / goals / overview / profile-update via `api.*`.
- `dal/learner.dal.ts` — **replace mocks** with real cookie-forwarded server fetches:
  `getLearnerOverview`, `getLearnerSchedule` (from bookings/me), `getLearnerLibrary` (digital
  bookings + saved), `getLearnerNotes`, `getLearnerGoals`.
- `hooks/use-learner.ts` — save/unsave, note CRUD, goal CRUD; invalidate query keys on success
  (mirror `hooks/use-profile.ts`).
- Mocks stay only for deferred features (recommendations) until their API lands.

---

## 8. UX flows

**Buy a digital product** — Explore / ⌘K → `/c/[username]` → offering → book (`digital`) →
Razorpay → confirm → appears in **Library** → download via `GET /uploads/digital/:bookingId`.

**Book a 1:1 session** — profile → slot picker → checkout → confirm → **Schedule** (join link,
reschedule/cancel) + reminder.

**Join a workshop/event** (`live_event`, group|webinar) — profile → reserve seat → pay →
**Schedule** → join Meet at the fixed time.

**Track progress** — v1 = **Goals** (create / update / complete) on `/learner/growth`. Per-content
progress + certificates are deferred (placeholder noting "coming with structured content").

**Manage schedule** — `/learner/schedule` list + calendar; cancel via real
`POST /bookings/:id/cancel` (refund server-side); open `SessionDrawer` for details/notes.

---

## 9. Design system — `theme-learner` (calm pastel)

A scoped token layer in `globals.css` (`.theme-learner` and `.dark .theme-learner`), applied on the
learner layout wrapper. Global tokens (the blue used elsewhere) are untouched.

- **Surfaces** — neutral, low-chroma backgrounds; `card` gently elevated; generous whitespace for
  long, comfortable sessions.
- **Accents** — one calm primary (soft indigo/teal, lower chroma than global blue) + 3–4 **pastel
  category accents** (sage, peach, lavender, sky) for chips / section headers, used sparingly —
  never flooding the page.
- **Radius** — cards `rounded-2xl` (~16–20px); pills `rounded-full`.
- **Shadows** — soft, low-spread.
- **Light + dark both first-class** — dark is deep neutral (not pure black); accents desaturated for
  comfort; contrast targets WCAG AA. Not a colour inversion.
- **Typography** — `font-display` (Bricolage Grotesque) for section titles; `font-sans` (Geist) body;
  defined size/weight scale.
- **Icons** — Font Awesome only.

**Components** — reuse shadcn primitives: Card, Tabs, Sheet (drawers), Dialog, **Command** (⌘K),
Progress, Badge, Avatar, ScrollArea, Skeleton, Separator, Switch. New composables in
`components/learner/*`: `CommandPalette`, `LearnerTabBar` (mobile bottom nav), `SectionCard`,
`SessionRow` / `SessionDrawer`, `LibraryItemCard`, `SavedCard`, `NoteCard` + `NoteEditorSheet`,
`GoalCard`, `EmptyState`, `StatPill`, plus an extension of `LearnerHeader` for the workspace nav
(desktop links + palette trigger).

**States** — every list has a loading skeleton, a calm empty state, and an error toast (shadcn
toast). Clear hover/focus rings. Fully responsive: 1-col mobile → multi-col desktop; drawers become
full-screen sheets on mobile.

---

## 10. Wireframe strategy (per screen)

- **Home `/learner`** — greeting → "Next up" hero card (next session + Join) → "Continue" row
  (recent digital) → "Your goals" compact strip → "Recommended for you" creators row → quiet quick
  actions. Max-width container, calm spacing, subtle ⌘K hint.
- **Schedule** — segmented Upcoming / Past; month calendar on desktop, agenda list on mobile; each
  item opens `SessionDrawer`.
- **Library** — segmented tabs Purchases / Downloads / Saved / Notes; responsive card grid;
  `NoteEditorSheet` for create/edit.
- **Growth** — goals board (Active / Done) + add-goal; clearly-labeled placeholders for progress &
  certificates.
- **Account** — profile + goal/interests editor (reuse the onboarding niche/goal pickers) +
  preferences + theme toggle.

---

## 11. Implementation phases

1. **Foundation** — `theme-learner` tokens; apply on layout; extend header nav + `CommandPalette`;
   `/learner/dashboard` → `/learner` redirect.
2. **Real read paths** — types + `learner.service`/`dal` real fetches; Home + Schedule + Library
   (bookings/me, digital, saved-read) with skeletons/empty states, responsive, dark.
3. **New backend + write paths** — schema tables (saved/notes/goals) + migration; `learner` module
   (controllers/services/repos); web hooks; wire Saved, Notes, Goals UI; `PATCH learner-profile`
   for Account.
4. **Polish** — recommendations (simple niche match), progress/cert placeholders, route transitions,
   a11y/contrast pass, full responsive + light/dark QA.

---

## 12. Constraints honored (project hard rules)

- Icons: **Font Awesome only** (no `lucide-react` outside vendored `components/ui/*`).
- Web data flow: component → service → dal → `lib/api.ts` (only place a raw `fetch` is allowed).
- Auth: `requireLearner()` in the layout (server-side); middleware stays cookie-only.
- Roles parsed with `parseRoles()`; full cookie header forwarded (`cookies().toString()`).
- Prices in paise (DB) / INR (API). Toasts via shadcn toast.

---

## 13. Verification (when built)

1. `pnpm --filter @creonex/types build`; `pnpm type-check` (web + api) clean; migration applied.
2. As a learner: Home shows real next session + recent; Schedule lists real `/bookings/me` and
   cancel works; Library shows real digital purchases + working download; save/unsave persists;
   note create/edit/delete persists; goal create/complete persists; Account edits persist.
3. ⌘K opens / navigates / searches; session & note overlays are URL-driven (Back works).
4. Full responsive pass (mobile → desktop); light + dark both first-class (AA contrast); no
   admin-sidebar feel; pastel applied only via `theme-learner` (global blue unaffected elsewhere).
