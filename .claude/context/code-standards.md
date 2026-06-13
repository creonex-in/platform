# Code Standards

## General
- Small, single-purpose modules. One domain concern per file.
- Fix root causes; don't layer workarounds or special-cases over shared code.
- Reuse existing helpers before writing new ones (`@creonex/types`, `lib/utils`, dal, services).
- Keep code consistent with the surrounding file's style.

## TypeScript
- Strict mode. No `any` — use explicit interfaces; share cross-app types via `@creonex/types`.
- Validate external input at boundaries (DTOs on the API; typed responses on the web).
- Prefer narrow return types; let `ApiError` carry status, not booleans.

## Next.js (apps/web)
- Default to Server Components. Add `'use client'` only for interactivity.
- Server data: call dal (server-only) from Server Components. Client data: TanStack Query hooks → services.
- Never `fetch` in a component/page. Go through `services → dal → lib/api`.
- Auth/role gating lives in layouts via `requireAuth/requireCreator/requireLearner`, not middleware.
- Forward cookies with `cookies().toString()`. Wrap per-request reads in `cache()` (see `dal/users.dal.ts`).
- A failed server fetch throws → handled by `app/error.tsx`. Don't swallow into `null` (false logout).

## NestJS (apps/api)
- Controller stays thin: validation + delegation. Logic in services, queries in repositories.
- DTOs use class-validator/class-transformer (global `ValidationPipe`, `whitelist: true`).
- Throw Nest `HttpException`s (`NotFoundException`, `BadRequestException`, …) — never raw `Error` for expected cases.
- Protect routes with `@UseGuards(AuthGuard, RolesGuard)` + `@Roles(...)`.
- Don't re-enable the global body parser (`main.ts` disables it for Better Auth).

## Styling & Icons
- Tailwind v4 + design tokens only — use `bg-background`, `text-muted-foreground`, etc. No hardcoded hex/oklch in components.
- Icons: **Font Awesome only** (`@fortawesome/react-fontawesome` + `free-solid`/`free-brands`). Never `lucide-react` outside `components/ui/*`.
- Radius via the scale (`--radius` = 0.9375rem); fonts via `--font-sans` / `--font-display` / `--font-mono`.

## Roles
- Parse with `parseRoles(roleString)` / `hasRole(roleString, role)` from `@creonex/types`. Never `role.split(',')`.

## File Organization (web)
- `app/` — routes & layouts        · `components/` — UI (`ui/` = shadcn)
- `services/` — API callers        · `dal/` — server-only data access
- `lib/` — infra (api, auth, utils) · `hooks/` — client hooks
- `providers/` — context providers · `types/` / `data/` — local types & mock data

## File Organization (api)
- `src/<domain>/` — `*.controller.ts` · `*.service.ts` · `*.repository.ts` · `*.dto.ts` · `*.module.ts`
- `src/auth/` — guards, decorators, session types · `src/database/` — schema + connection · `src/utils/` — filter, id helpers

## Protected — do not edit unless told
- `components/ui/*` (shadcn-generated) · Better Auth internals · generated `dist/`, `.next/`