# Creonex — Frontend

Learn from India's best creators. Book courses and 1-on-1 mentorship sessions with verified experts.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| UI Primitives | shadcn/ui |
| Icons | lucide-react + react-icons |
| Animations | tw-animate-css |
| Data fetching | TanStack Query v5 _(to be installed)_ |
| Runtime | React 19 |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/creonex-in/web.git
cd web

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in NEXT_PUBLIC_API_URL (ask team lead)

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build (TypeScript + ESLint must pass)
npm run start    # Serve production build
npm run lint     # Run ESLint
```

---

## Environment Variables

```env
# .env.local (never commit)
NEXT_PUBLIC_API_URL=http://localhost:3001    # Backend REST API base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000   # This app's public URL
```

---

## Project Structure

```
web/
├── app/                  # Next.js App Router (pages + root layout)
├── components/
│   ├── layout/           # Navbar, Footer, MobileNav
│   ├── sections/         # Full-width page sections
│   ├── shared/           # Reusable domain components
│   └── ui/               # shadcn primitives (do not edit)
├── features/             # Feature slices (data + hooks + feature UI)
├── lib/
│   ├── utils.ts          # cn() class utility
│   └── api/              # Typed fetch wrappers
├── types/                # Shared TypeScript types
├── constants/            # Static config
└── .claude/              # AI assistant context + documentation
```

---

## Documentation

Full documentation lives in `.claude/`:

| File | Contents |
|------|---------|
| [CLAUDE.md](.claude/CLAUDE.md) | Comprehensive AI + developer guide |
| [architecture.md](.claude/architecture.md) | System design, routing, rendering strategy |
| [ui-context.md](.claude/ui-context.md) | Design tokens, component patterns |
| [code-standards.md](.claude/code-standards.md) | TypeScript, React, Next.js standards |
| [style-guide.md](.claude/style-guide.md) | Brand colors, typography, spacing |
| [project-overview.md](.claude/project-overview.md) | Product brief, features, competitive context |
| [progress-tracker.md](.claude/progress-tracker.md) | Current phase, completed work, next steps |

**Read `.claude/CLAUDE.md` before making any code changes.**

---

## Design System

- **Brand color**: `#337DEB` (blue) — accessed via `var(--brand)` token
- **No gradients**: All backgrounds are flat solid colors
- **Fonts**: Inter (all UI), Instrument Serif (logo only), Plus Jakarta Sans (step numbers only)
- **Sections**: Always `.section > .container-inner > content`
- **Dark mode**: `.dark` class on `<html>` (never `prefers-color-scheme`)

---

## Branch Strategy

```
main      → production (PR-only, protected)
develop   → staging integration
feature/* → new features (branch from develop)
fix/*     → bug fixes (branch from develop)
```

---

## Architecture Decisions

- **Frontend-only repo** — backend is NestJS in a separate repository
- **Default Server Components** — add `"use client"` only when required
- **No client-side global state store** — TanStack Query for server data, `useState` for local UI
- **httpOnly cookies for auth** — no JWT in localStorage
- **Tailwind v4 with CSS custom properties** — no `tailwind.config.js`
