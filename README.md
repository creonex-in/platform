# Creonex Platform

A two-sided marketplace for India's creators — sell courses, 1:1 sessions, and workshops. Learners discover and book them.

## Monorepo structure

```
apps/
  api/   — NestJS 11 backend  (port 3000)
  web/   — Next.js 16 frontend (port 3001)
packages/
  types/             — shared @creonex/types (DTOs, roles, enums)
  typescript-config/ — shared tsconfig bases
  eslint-config/     — shared eslint config
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 20 |
| pnpm | >= 10 (`npm i -g pnpm`) |

---

## Getting started (fresh clone)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy the example files and fill in your values:

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env.local
```

See [Environment variables](#environment-variables) below for what each key means.


### 3. Start the dev servers

```bash
pnpm dev
```

This runs both apps in parallel. Turborepo automatically builds `packages/types` first, then starts both servers.

| App | URL |
|-----|-----|
| API | http://localhost:3000 |
| Web | http://localhost:3001 |
| API docs (Swagger) | http://localhost:3000/api |

---

## Running individual apps

```bash
# API only
pnpm --filter @creonex/api dev

# Web only
pnpm --filter @creonex/web dev
```

> If you run an app individually, build the shared types package first:
> ```bash
> pnpm --filter @creonex/types build
> ```

---

## Environment variables

### `apps/api/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default `3000`) |
| `DATABASE_URL` | Yes | Neon Postgres pooled connection string |
| `DATABASE_DIRECT_URL` | Yes | Neon Postgres direct connection (for migrations) |
| `BETTER_AUTH_SECRET` | Yes | Secret key for Better Auth — min 32 chars |
| `BETTER_AUTH_URL` | Yes | Public URL of this API |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins (e.g. `http://localhost:3001`) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `CALENDAR_TOKEN_ENC_KEY` | Yes | 64-char hex key for encrypting calendar tokens — generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `API_BASE_URL` | Yes | Public base URL of the API (used for OAuth callbacks) |
| `RAZORPAY_KEY_ID` | No | Razorpay key ID (payment features disabled if blank) |
| `RAZORPAY_KEY_SECRET` | No | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | No | Razorpay webhook secret |

Get Neon credentials from [neon.tech](https://neon.tech) and Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/).

### `apps/web/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | URL of the API (`http://localhost:3000` locally) |
| `NEXT_PUBLIC_WEB_URL` | Yes | URL of the web app (`http://localhost:3001` locally) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name for image uploads |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Yes | Cloudinary unsigned upload preset |

Get Cloudinary credentials from [cloudinary.com](https://cloudinary.com/).

---

## Database commands

All run from the repo root:

```bash
# Generate migration files from schema changes
pnpm --filter @creonex/api db:generate

# Apply migrations
pnpm --filter @creonex/api db:migrate

# Push schema directly (dev shortcut, skips migration files)
pnpm --filter @creonex/api db:push

# Open Drizzle Studio (visual DB browser)
pnpm --filter @creonex/api db:studio
```

---

## Other commands

```bash
pnpm build        # build all apps and packages
pnpm lint         # lint all apps and packages
pnpm type-check   # type-check all apps and packages
```

---

## Troubleshooting

### `Cannot find module '@creonex/types'`

The shared types package needs to be built. Running `pnpm dev` from the repo root does this automatically. If you're running an app individually:

```bash
pnpm --filter @creonex/types build
```

### Port already in use

Kill the process on the port:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### `pnpm install` fails

Make sure you're on Node.js >= 20:

```bash
node -v   # must be v20 or higher
```

If using `nvm`: `nvm use 20`
