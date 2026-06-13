# Architecture Context

Monorepo: **Turborepo + pnpm workspaces**. Node ≥ 20, `pnpm@10.34.2`.

## Stack

| Layer       | Technology                                   | Role                              |
| ----------- | -------------------------------------------- | --------------------------------- |
| Frontend    | Next.js 16 (App Router, Turbopack), React 19 | Web app, port 3001                |
| Backend     | NestJS 11 + Express 5                         | REST API, port 3000, prefix `/api`|
| Auth        | Better Auth 1.6 (in NestJS) + admin plugin   | email/password + Google OAuth     |
| Database    | Drizzle ORM + Neon Postgres                  | persistence                       |
| UI          | Tailwind v4 + shadcn + Font Awesome          | styling + components              |
| Data fetch  | TanStack Query (client) + RSC (server)       | web data access                   |
| Shared      | `@creonex/types`                             | types, roles, enums across apps   |

## System Boundaries

- `apps/web/app` — App Router routes. Route groups: `(auth)`, `(signup)`,
  `(split-auth)`, `(creator)`, `learner/(dashboard)`, `onboarding`, `c/[username]`.
- `apps/web/lib` — infra: `api.ts` (the only raw fetch), `auth-client.ts`,
  `auth-server-client.ts`, `auth-guards.ts`, `endpoints.ts`, `utils.ts`.
- `apps/web/services` — typed API callers (one per domain), call `lib/api`.
- `apps/web/dal` — server-only data access; forwards cookies, wraps `getMe` in `cache()`.
- `apps/web/components` — UI; `components/ui/*` are vendored shadcn primitives.
- `apps/web/proxy.ts` — middleware (cookie-only gate, injects `x-pathname`).
- `apps/api/src/<domain>` — Nest modules: `auth`, `users`, `creators`,
  `onboarding`, `database`. Each = controller + service + repository + dto.
- `packages/types` — shared `@creonex/types` (build to `dist/` before consuming runtime helpers).

## Web data flow (strict)

```
component / page ──► React Query hook (client)  ─┐
                 └─► Server Component            ─┴─► services/*.service.ts ─► dal/*.dal.ts ─► lib/api.ts ─► API
```
`lib/api.ts` is the single place a raw `fetch` is allowed. It throws typed
`ApiError(status, message)`; network failure → `ApiError(0, ...)` (GET retried once).

## API request flow

```
Controller (@Roles + RolesGuard, DTO validation) ─► Service (business logic) ─► Repository ─► Drizzle (db)
```
Errors thrown as Nest `HttpException`s; a global `AllExceptionsFilter`
(`src/utils/all-exceptions.filter.ts`) normalizes every response to
`{ statusCode, message, error, path, timestamp }` and maps Better Auth `APIError`.

## Storage Model
- **Neon Postgres** (Drizzle): Better Auth tables (`user`, `session`, `account`,
  `verification`) + domain tables (`learnerProfiles`, `creatorProfiles`,
  `creatorTags`, `offerings`, `testimonials`). Enums for niche/goal/offer/kyc/onboarding.
- **Cloudinary** (client upload): profile photos, banners, offering thumbnails.

## Auth & Access Model
- Better Auth runs inside NestJS (`/api/auth/*`), Drizzle adapter, admin plugin
  (`defaultRole: 'learner'`, `adminRoles: ['admin']`).
- Web middleware checks only that a session cookie exists (`better-auth.session_token`,
  `__Secure-` prefixed in prod) — no network, no role logic.
- Server components enforce auth + role via `lib/auth-guards.ts`:
  `requireAuth`, `requireCreator`, `requireLearner`.
- API enforces with `AuthGuard` + `RolesGuard` (`@Roles(...)`).
- Roles = comma string; parse with `parseRoles()` / `hasRole()` from `@creonex/types`.

## Invariants
1. Middleware never makes network calls and never validates roles.
2. UI never calls `fetch` directly — only through services → dal → `lib/api`.
3. Always forward the full cookie header (`cookies().toString()`), never one cookie.
4. Never use `lucide-react` outside vendored `components/ui/*`.
5. Role logic goes through `@creonex/types` helpers, never raw `.split(',')`.
6. API responses keep the normalized error envelope; DTOs validate all input.
