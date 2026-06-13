---
name: run-api
description: Build, run, and drive the Creonex API (NestJS server on port 3000). Use to start the api, launch the backend, smoke-test endpoints, check the health route, open Swagger, or verify the api works. Driver is curl-based (smoke.sh).
---

# Run the Creonex API (`@creonex/api`)

NestJS 11 + Express 5 server. Drizzle ORM over a Neon Postgres DB, auth via
better-auth. Listens on **port 3000**, all routes under the global prefix
`/api`. Driven with **curl** — the harness is
[.claude/skills/run-api/smoke.sh](.claude/skills/run-api/smoke.sh).

All paths below are relative to `apps/api/`. Commands were run from there in
git-bash on Windows; they also work on Linux.

## Prerequisites

- Node >= 20, pnpm 10 (repo pins `pnpm@10.34.2`).
- Install deps from the **repo root** (pnpm workspace): `pnpm install`.
- `apps/api/.env` must exist. Required keys (already present in this checkout):
  ```
  PORT=3000
  DATABASE_URL=            # Neon pooled connection string
  DATABASE_DIRECT_URL=     # Neon direct connection (migrations)
  BETTER_AUTH_SECRET=
  BETTER_AUTH_URL=http://localhost:3000
  ALLOWED_ORIGINS=http://localhost:3001
  GOOGLE_CLIENT_ID=        # optional; blank disables Google OAuth
  GOOGLE_CLIENT_SECRET=
  ```
  On a fresh machine with no `.env`, copy these keys in. The server boots
  without Google creds (Google sign-in just won't work).

## Run (agent path) — START HERE

1. Launch the server in the background (from `apps/api/`):
   ```bash
   pnpm dev > /tmp/api.log 2>&1 &
   ```
   `pnpm dev` = `cross-env PORT=3000 nest start --watch`. Wait for this line:
   ```
   [NestApplication] Nest application successfully started
   ```
   (~20s cold: `Starting compilation in watch mode...` → `Found 0 errors` →
   route mapping → started.)

2. Drive it with the smoke script:
   ```bash
   BASE=http://localhost:3000 bash .claude/skills/run-api/smoke.sh
   ```
   Expected output:
   ```
   PASS  health  (200)  http://localhost:3000/api
   PASS  swagger-ui  (200)  http://localhost:3000/api/docs
   PASS  users/me 401  (401)  http://localhost:3000/api/v1/users/me
   PASS  auth/session  (200)  http://localhost:3000/api/auth/get-session
   PASS  health-body
   ALL PASS
   ```

3. Hit individual routes directly:
   ```bash
   curl -s http://localhost:3000/api                      # {"status":"ok","service":"creonex-api"}
   curl -s http://localhost:3000/api/auth/get-session     # null when no session cookie
   curl -s http://localhost:3000/api/v1/users/me          # {"statusCode":401,"message":"Unauthorized"}
   ```

### Route map (all prefixed `/api`)
- `GET /api` — health
- `GET /api/docs` — Swagger UI
- `ALL /api/auth/*` — better-auth handler (sign-up/in, sessions)
- `GET /api/v1/users/me`, `POST /api/v1/users/me/add-creator-role`,
  `GET /api/v1/users/me/creator-profile`, `GET /api/v1/users/me/learner-profile`
- `GET /api/v1/creators/:username`
- `POST /api/v1/onboarding/learner/step-1`,
  `POST /api/v1/onboarding/creator/step-{1,2,3,4}`

## Run (production-ish)

```bash
pnpm build       # nest build -> dist/
pnpm start       # cross-env PORT=3000 node dist/main
```
Then drive with the same `smoke.sh`. `pnpm dev` is preferred for iteration.

## Database

```bash
pnpm db:generate   # drizzle-kit generate (SQL from schema)
pnpm db:migrate    # tsx --env-file=.env migrate.ts
pnpm db:push       # drizzle-kit push (sync schema, no migration files)
pnpm db:studio     # drizzle-kit studio (browse DB)
```
The dev DB is a live Neon instance from `.env` — it's already migrated; you do
**not** need to run migrations just to boot the server.

## Test / lint

```bash
pnpm type-check    # tsc --noEmit
pnpm lint          # eslint
```
(No unit-test suite is wired up in this app.)

## Gotchas

- **Health is at `/api`, not `/`.** `app.setGlobalPrefix('api')` rewrites every
  route, including the root `AppController`. `GET /` is a 404.
- **`bodyParser: false` + manual JSON.** `main.ts` disables Nest's body parser
  and mounts `express.json()` itself, because the better-auth handler
  (`/api/auth/*`) needs the raw request. Don't re-enable the global parser.
- **Two ready signals.** `Found 0 errors. Watching for file changes.` only means
  *compiled*. The server is up only after `Nest application successfully
  started`. Curling between the two gives connection-refused.
- **CORS is locked to `ALLOWED_ORIGINS`** (default `http://localhost:3001`).
  The web app on :3001 works; other origins are rejected with credentials.
- **`get-session` returns `200` with body `null`** when unauthenticated — not
  401. Only the NestJS `@Controller` routes (e.g. `users/me`) return 401.

## Troubleshooting

- `EADDRINUSE :3000` — a previous `nest start` is still running. Kill it:
  `powershell "Get-NetTCPConnection -LocalPort 3000 | Select -Expand OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }"`.
- Boot hangs / DB errors at startup — check `DATABASE_URL` in `.env` is a valid
  reachable Neon string. The better-auth drizzle adapter initializes at boot.
- `curl: connection refused` — server not ready yet; wait for the
  `successfully started` log line (see Gotchas).
