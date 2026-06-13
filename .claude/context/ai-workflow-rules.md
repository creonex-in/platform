# AI Workflow Rules

## Approach
Build incrementally against the context files. Read `project-overview`,
`architecture`, and `code-standards` before implementing. Don't invent product
behavior — if it's not defined, ask or record it as an open question.

## Scoping Rules
- One feature unit at a time; small verifiable increments over big speculative changes.
- Don't mix unrelated boundaries in one step (e.g. a web layout change + an unrelated API route).
- If a change can't be verified end to end quickly, it's too broad — split it.

## When to Split Work
Split if a step combines:
- Web UI changes **and** API/schema changes (do API + migration first, then wire UI).
- Multiple unrelated API modules or routes.
- Behavior not clearly defined in the context files.

## Respect the layers
- Web: never bypass `services → dal → lib/api`. New endpoint = add to `lib/endpoints.ts`, a service method, then a dal/hook.
- API: new feature = controller + service + repository + dto in its module; guard with `@Roles` where access-controlled.
- Shared shapes go in `@creonex/types` and are consumed by both apps.

## Verifying (user runs the servers)
Do NOT launch `pnpm dev` — the user runs the apps. Verify your work with:
- `pnpm --filter @creonex/web type-check` and `... @creonex/api type-check`
- `pnpm lint`; grep/static checks for rule violations (raw fetch, lucide, `.split(',')`)
- Ask the user to run the app and report; use the `run-api` / `run-web` skills as reference for how.

## Handling Missing Requirements
- Don't invent flows. Resolve ambiguity in the relevant context file first.
- Missing requirement → add to `progress-tracker.md` Open Questions before continuing.

## Protected Files — don't modify unless told
- `components/ui/*` (shadcn) · Better Auth internals · `packages/types/dist` (regenerate via build) · generated `.next/`, `dist/`

## Keeping Docs in Sync
Update the matching context file whenever you change: architecture/boundaries,
storage/schema, auth model, conventions, or feature scope. Update
`progress-tracker.md` after every meaningful change.

## Before Moving to the Next Unit
1. Unit works end to end within its scope.
2. No `architecture.md` invariant violated (check the 6 invariants).
3. `progress-tracker.md` updated.
4. `pnpm type-check` (and `pnpm build` when relevant) passes for the touched app(s).
