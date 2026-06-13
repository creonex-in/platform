# Progress Tracker

Update after every meaningful implementation change.

## Current Phase
- **Offerings → Availability → Bookings → Payments.** Auth/data-layer hardening done; now building the booking/scheduling system end-to-end.

## Current Goal
- Creators publish offerings (1:1 / group / workshop / digital), set availability; learners discover, book a slot or seat, pay via Razorpay, and manage bookings. Plan: `docs/offerings-bookings-slots-schedulies.md` (rewritten to real Better Auth + Drizzle stack).

## Completed
- Monorepo: `apps/web` (Next 16), `apps/api` (NestJS 11), `packages/types`.
- Auth: Better Auth in NestJS (email/password + Google), admin plugin, RBAC.
- Creator onboarding (4 steps + go-live), public profile `/c/[username]`, creator/learner dashboards (learner data still mocked).
- **Auth refactor:** middleware (`proxy.ts`) now cookie-only, no network, injects `x-pathname`. Server guards in `lib/auth-guards.ts` (`requireAuth/requireCreator/requireLearner`); layouts use them.
- **Audit fixes:** removed raw fetch + manual single-cookie in learner dashboard (now `needsLearnerOnboarding` dal) and `post-oauth` route (full cookie header + `parseRoles`).
- **API global exception filter** (`src/utils/all-exceptions.filter.ts`) — normalized envelope, handles Better Auth `APIError`.
- **lib/api.ts hardened** — network failure → typed `ApiError(0)`, GET retried once.
- Icon rule enforced: migrated 3 files off `lucide-react` → Font Awesome.
- Cleanup: deduped `getInitials`, extracted onboarding helpers (`splitFullName`, `loadCreatorAtStep`), deleted dead code.
- Run skills authored: `apps/api/.claude/skills/run-api`, `apps/web/.claude/skills/run-web`.

## In Progress
- Offerings/Bookings plan finalized to real stack (`docs/offerings-bookings-slots-schedulies.md`).
- Migrations `0003` (scheduling) + `0004` (creator-profile cleanup) generated; user applied locally.

## Recently done
- **User-chosen usernames:** killed server-side `generateUsername` suffix loop (`srikar`→`srikar1`). Step-1 now collects display name + handle; live availability via `GET /api/v1/onboarding/creator/username-check` (owner-aware) + `useUsernameAvailability` debounced hook. Format rules in `@creonex/types` (`validateUsername`, `USERNAME_REGEX`, reserved list). Handle stored at step-1, used verbatim at go-live.
- **Onboarding redesign (premium):** split-screen shell — dark `OnboardingRail` (brand + value prop + named vertical step journey via `usePathname`) + flattened content (removed per-step `rounded-3xl shadow-xl` cards + thin progress bars). `font-display` headers, `StepHeading` shared component, restrained surfaces. Searchable + denser 3-col niche grid (20 niches). Banner preset color cards de-rounded.

## Scheduling stack (decided)
- **date-fns** (slot/interval math), **date-fns-tz** (UTC↔local), **rrule** (recurring availability), **googleapis** (Calendar + Meet). No Luxon.
- Recurrence-driven: reusable creator `schedules` (tz-anchored) → `schedule_rules` (RRULE + local HH:MM) → `schedule_overrides`. Offering references a schedule.
- Bookings stored UTC (`timestamptz`); slots returned in learner tz. Meeting URL is **per-booking dynamic** (provider abstraction), not a static link on offering.

## Next Up (build order)
1. Migration `0003` (comprehensive): enums `booking_status`, `override_type`; tables `schedules`, `schedule_rules`, `schedule_overrides`, `calendar_connections`, `bookings`; alter `offerings` (+`schedule_id`, `min_notice_minutes`, `booking_window_days`, `buffer_after_minutes`, `min_participants`); partial unique index on bookings. **No `meeting_link`.**
2. `OfferingsModule` — extract from `users/` repo; CRUD + status state machine.
3. `AvailabilityModule` + `SlotGenerationService` (date-fns + date-fns-tz + rrule).
4. `CalendarIntegrationModule` — Google OAuth + token refresh + freebusy → wire into slot gen.
5. `MeetingModule` — `MeetingProvider` interface + `GoogleMeetProvider` + `MeetingService` (Zoom/Teams later).
6. `PaymentModule` (Razorpay order/verify/webhook/refund).
7. `BookingsModule` — create → order → confirm → enqueue Meet → cancel; races (`SELECT FOR UPDATE` + partial unique; atomic seat decrement).
8. Web: reusable `AvailabilityScheduleBuilder` → mount full on `/creator/availability` + lite-with-expander in onboarding `step-4` (extend step-4 schema/mutation for `timezone`+`rules`, one-tx create schedule+offering); optional Google-connect CTA (never blocks Go-Live); slot picker, checkout, booking views.
- Deferred: replace mocked learner dashboard data (`dal/learner.dal.ts`) with real API.

## Open Questions
- `digital` offer_type: no slots/seats — buy = instant access/download. Flow undefined.
- `workshop` offer_type: treat like `group` (fixed time + seats) or its own flow?
- **Creator-profile field cleanup (done, migration `0004`):** dropped `niche_category` + `response_time_hrs`; step-1 niche question repointed to `primary_niche` (20-niche enum, profile + discovery index now populated); `experience_years` added as optional step-2 field. **Decided:** on booking-confirm increment `creator_profiles.total_sessions` (single session-count truth) + `offerings.total_bookings` (per-offering) — wire when BookingsModule built.
- Bookings link `learner_profiles.id` — auto-create profile on first booking?
- Meet creation failure after payment: confirm-first + retried job (don't block payment). Permanent-fail policy (refund vs manual link)?
- Calendar OAuth tokens: encryption-at-rest mechanism (KMS vs app-level AES via `CALENDAR_TOKEN_ENC_KEY`).
- Payments/payouts: Razorpay charge wired; creator payout flow still TBD.
- Multi-role storage: keep comma string, or normalize to `user_roles` later?

## Architecture Decisions
- **Edge cookie gate + server guards** over middleware `getSession()` — removes per-nav network call; RBAC centralized in `lib/auth-guards.ts`.
- **Comma-string roles** kept (Better Auth admin plugin compatible); access-control plugin deferred — see `docs/rbac-access-control-enhancement.md`.
- **`lib/api.ts` is the only fetch site**; typed `ApiError` flows through dal → server components → `app/error.tsx`.

## Session Notes
- User runs the dev servers; agent verifies via type-check/lint/grep, not by launching.
- After API changes touching runtime helpers in `@creonex/types`, rebuild it (`pnpm --filter @creonex/types build`).
- Last verified: both apps `type-check` clean; API error envelope confirmed (401/404) live.
