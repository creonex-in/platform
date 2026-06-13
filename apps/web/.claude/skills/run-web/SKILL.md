---
name: run-web
description: Build, run, and drive the Creonex web app (Next.js 16 frontend on port 3001). Use to start the web app, launch the frontend, take a screenshot of a page, render a route headless, or verify the UI works. Driver is headless Chrome (shot.sh).
---

# Run the Creonex web app (`@creonex/web`)

Next.js 16 (App Router, Turbopack, React 19). Runs on **port 3001**. Talks to
the API (`@creonex/api`) via `NEXT_PUBLIC_API_URL`. Driven with **headless
Chrome** — the harness is
[.claude/skills/run-web/shot.sh](.claude/skills/run-web/shot.sh), which
screenshots a route and dumps its `<title>` to prove a real render.

All paths below are relative to `apps/web/`. Commands were run from there in
git-bash on Windows; the only OS-specific bit (the Chrome path) is auto-detected
by `shot.sh`.

## Prerequisites

- Node >= 20, pnpm 10. Install from the **repo root**: `pnpm install`.
- A Chromium-family browser for the driver. On this machine Chrome is at
  `C:\Program Files\Google\Chrome\Application\chrome.exe` — `shot.sh` finds it
  automatically (also checks Edge, `google-chrome`, `chromium`). Override with
  `CHROME=/path/to/browser`.
- `apps/web/.env.local` must exist. Keys (already present in this checkout):
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3000     # the @creonex/api server
  NEXT_PUBLIC_WEB_URL=http://localhost:3001
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
  ```
- For pages that fetch real data (creator profiles, dashboards), the API must
  also be running — see the `run-api` skill. The homepage and static marketing
  routes render fine without it.

## Run (agent path) — START HERE

1. Launch the dev server in the background (from `apps/web/`):
   ```bash
   pnpm dev > /tmp/web.log 2>&1 &
   ```
   `pnpm dev` = `next dev -p 3001`. Wait for:
   ```
   ✓ Ready in ~1s
   ```

2. **Warm the route first** — Turbopack compiles on first request (~4s for `/`):
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/
   ```

3. Screenshot + verify a route:
   ```bash
   bash .claude/skills/run-web/shot.sh /          home.png
   bash .claude/skills/run-web/shot.sh /creators  creators.png
   ```
   Expected (homepage):
   ```
   browser: /c/Program Files/Google/Chrome/Application/chrome.exe
   shooting: http://localhost:3001/ -> home.png
   screenshot exit: 0 (~440000 bytes)
   title: <title>Creonex — Learn from India's Best Creators</title>
   ```
   **Open the PNG and look at it.** A real render shows the Creonex nav,
   "Designed to help you actually grow." hero, the stats row
   (45,000+ / 180+ / 12,000+ / 99.2%), and the "Personalized Learning" section.
   Blank/white = render failed (see Gotchas).

### Useful routes to drive
- `/` — main landing for learners / any user (no API needed)
- `/creators` — creator-features / "become a creator" landing
- `/top-creators`, `/top-creators/[slug]` — niche-based top-creators discovery
- `/sign-in`, `/sign-up`, `/sign-up/creator`, `/sign-up/learner` — auth
- `/c/[username]` — public creator profile (needs API + data)
- `/onboarding/creator/step-{1,2,3,4}`, `/onboarding/creator/complete`
- `/learner/dashboard`, `/dashboard` (creator) — gated dashboards (need auth)

## Run (production build)

```bash
pnpm build       # next build (Turbopack)
pnpm start       # next start -p 3001
```
Drive with the same `shot.sh`. Use `pnpm dev` for iteration.

## Test / lint

```bash
pnpm type-check    # tsc --noEmit
pnpm lint          # eslint (eslint-config-next)
```
(No component/e2e test suite is wired up.)

## Gotchas

- **First request to any route is slow (~4s)** — Turbopack compiles on demand.
  `shot.sh` uses `--virtual-time-budget=8000` to wait, but if you screenshot a
  brand-new route before warming it with `curl`, you may catch a blank frame.
  Warm with `curl` first.
- **`proxy.ts` (middleware) runs on every request** — it's in the request path
  (you'll see `proxy.ts: NNNms` in the dev log). Auth/role redirects happen
  here, so a screenshot of a gated route may actually be a redirect to
  `/sign-in`. Check the dumped `<title>` if a page looks unexpected.
- **The hero `<h1>` is not in the initial DOM** — it's a GSAP split-text
  animation injected after hydration, so `--dump-dom` shows `<title>` but no
  `<h1>`. Use the screenshot (not DOM grep) to verify the hero rendered.
- **Icons are Font Awesome, not lucide.** (`lucide-react` is in deps but the
  app standard is `@fortawesome/*`.) Irrelevant to launching, relevant if you
  edit UI.
- **Data pages need the API on :3000.** A creator profile or dashboard with the
  API down renders error/empty states, not a crash.

## Troubleshooting

- `No Chrome/Edge/Chromium found` — set `CHROME=/path/to/chrome.exe` before the
  command.
- Screenshot is 0 bytes / blank — the route wasn't compiled yet; `curl` it once,
  then re-run `shot.sh`. Or the dev server isn't up — check `/tmp/web.log` for
  `✓ Ready`.
- `EADDRINUSE :3001` — old `next dev` still running. Kill it:
  `powershell "Get-NetTCPConnection -LocalPort 3001 | Select -Expand OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }"`.
- API calls fail in the browser console — the API rejects CORS unless the web
  origin is in the API's `ALLOWED_ORIGINS` (default `http://localhost:3001`, so
  it works out of the box).
