# Creonex Platform

Monorepo (Turborepo + pnpm) for **Creonex** — a platform where India's creators
sell courses, 1:1 sessions, and workshops, and learners discover and book them.

- `apps/web` — Next.js 16 App Router frontend (port 3001)
- `apps/api` — NestJS 11 backend + Better Auth + Drizzle/Neon Postgres (port 3000)
- `packages/types` — shared `@creonex/types` (DTced types, roles, enums)

## Read before implementing

Read these in order before any architectural decision:

1. `context/project-overview.md` — product, roles, features, scope
2. `context/architecture.md` — stack, layers, auth model, invariants
3. `context/ui-context.md` — theme tokens, fonts, icons, layout patterns
4. `context/code-standards.md` — implementation rules
5. `context/ai-workflow-rules.md` — workflow, scoping, protected files
6. `context/progress-tracker.md` — current state, decisions, next steps

Update `context/progress-tracker.md` after each meaningful change. If a change
alters architecture, scope, or standards, update the relevant context file first.

## Hard rules (full detail in context files)

- **Icons: Font Awesome only** (`@fortawesome/*`). Never `lucide-react` outside
  vendored `components/ui/*` shadcn primitives.
- **Web data flow:** component/page → `services/*.service.ts` → `dal/*.dal.ts` →
  `lib/api.ts`. `lib/api.ts` is the ONLY place a raw `fetch` is allowed.
- **API data flow:** controller → service → repository → Drizzle. DTOs validated
  with class-validator.
- **Auth:** middleware (`proxy.ts`) is cookie-only, no network. Real auth + RBAC
  in server components via `lib/auth-guards.ts` (`requireAuth/requireCreator/requireLearner`).
- Forward the **full cookie header** (`cookies().toString()`), never a single cookie.
- Roles are a comma string — parse with `parseRoles()` from `@creonex/types`, never `.split(',')`.

## Run the apps

The user runs the dev servers. Don't launch them. To understand how:
`apps/api/.claude/skills/run-api` and `apps/web/.claude/skills/run-web`.

## Commands (from repo root)

- `pnpm dev` — turbo: both apps · `pnpm build` · `pnpm lint` · `pnpm type-check`
- API DB: `pnpm --filter @creonex/api db:generate | db:migrate | db:push | db:studio`
