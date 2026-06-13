# Progress Tracker

Update after every meaningful implementation change.

## Current Phase
- In progress — core platform built; hardening auth, data layer, and conventions.

## Current Goal
- Robust, consistent auth + data-access architecture across web and API.

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
- This `.claude` context documentation.

## Next Up
- Replace mocked learner dashboard data (`dal/learner.dal.ts`) with real API + repositories.
- Optional: network-aware message + segment-level `error.tsx` in dashboard groups.

## Open Questions
- Payments/payouts: real processor + flow? (currently out of scope / placeholder)
- Booking backend: how are sessions/workshops persisted and scheduled?
- Multi-role storage: keep comma string, or normalize to a `user_roles` table later?

## Architecture Decisions
- **Edge cookie gate + server guards** over middleware `getSession()` — removes per-nav network call; RBAC centralized in `lib/auth-guards.ts`.
- **Comma-string roles** kept (Better Auth admin plugin compatible); access-control plugin deferred — see `docs/rbac-access-control-enhancement.md`.
- **`lib/api.ts` is the only fetch site**; typed `ApiError` flows through dal → server components → `app/error.tsx`.

## Session Notes
- User runs the dev servers; agent verifies via type-check/lint/grep, not by launching.
- After API changes touching runtime helpers in `@creonex/types`, rebuild it (`pnpm --filter @creonex/types build`).
- Last verified: both apps `type-check` clean; API error envelope confirmed (401/404) live.
