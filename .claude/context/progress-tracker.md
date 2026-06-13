# Progress Tracker

## Current Phase
Booking system build-out. Auth + data layer done. Scheduling/offerings backend done. Next: Calendar, Meeting, Payments, Bookings, then Web UI.

## Completed

### Infrastructure
- Monorepo: `apps/web` (Next 16), `apps/api` (NestJS 11), `packages/types`.
- Auth: Better Auth (email/password + Google), admin plugin, RBAC, cookie-only middleware.
- API: global exception filter, normalized error envelope, `lib/api.ts` typed `ApiError`.
- Icons: Font Awesome only enforced across web.

### Onboarding + Profiles
- 4-step creator onboarding (profile, bio/tags, banner, first offering) + go-live.
- User-chosen usernames: step-1 collects handle, live availability check (`GET /onboarding/creator/username-check`), `validateUsername` in `@creonex/types`.
- **DB pre-fill fix:** sessionStorage draft → API fallback (`useCreatorProfile`) when no draft. `hasMeaningful` guard prevents empty `{}` blocking API.
- Public profile `/c/[username]`, creator/learner dashboards (learner data still mocked).

### Schema (migrations applied: 0001–0004)
- Migration 0003: `schedules`, `schedule_rules`, `schedule_overrides`, `calendar_connections`, `bookings`; enums `booking_status`, `override_type`; altered `offerings`.
- Migration 0004: dropped `niche_category`/`response_time_hrs`; added `primary_niche`, `experience_years`.

### API Modules
- **OfferingsModule** — CRUD + status state machine (`draft→live|paused|archived`). `GET/POST /api/v1/offerings`, `PATCH /:id`, `PATCH /:id/status`.
- **AvailabilityModule** — `SchedulesController` (creator CRUD for schedules/rules/overrides), `AvailabilityController` (`GET /api/v1/availability/offerings/:id/slots`), `SlotGenerationService` (RRULE + date-fns-tz, learner-tz-aware output).

## Next Up (build order)
4. `CalendarIntegrationModule` — Google OAuth + token refresh + freebusy (optional for MVP, slot gen works without it)
5. `MeetingModule` — `MeetingProvider` interface + `GoogleMeetProvider` (dynamic Meet URL per booking)
6. `PaymentModule` — Razorpay order/verify/webhook/refund
7. `BookingsModule` — create→order→confirm→enqueue Meet→cancel; `SELECT FOR UPDATE` race guard, atomic seat decrement
8. **Web** — `AvailabilityScheduleBuilder` component, `/creator/availability`, slot picker, checkout, booking views

## Open Questions
- `digital` offer type: no slots — buy = instant access. Flow TBD.
- `workshop`: treat like `group` (fixed time + seats)?
- Learner profile: auto-create on first booking?
- Meet creation fail after payment: retry job vs refund policy?
- Calendar token encryption-at-rest (KMS vs app-level AES).
- Creator payout flow (Razorpay route) TBD.

## Architecture Decisions
- Cookie-only middleware + server-component RBAC guards (no per-nav network call).
- Comma-string roles kept (Better Auth compatible); `parseRoles()` from `@creonex/types`.
- `lib/api.ts` only fetch site; `ApiError` flows dal → server components → `app/error.tsx`.
- DB stores prices in paise; API accepts/returns INR.
- Bookings UTC; slots returned in learner tz. Meeting URL per-booking dynamic.

## Session Notes
- User runs dev servers; agent edits + type-checks only.
- After `@creonex/types` changes: `pnpm --filter @creonex/types build`.
