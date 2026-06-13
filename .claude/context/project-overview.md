# Creonex

## Overview

Creonex is a marketplace platform for India's creators and experts to run their
teaching business — sell courses, host workshops, and take paid 1:1 mentorship
sessions — and for learners to discover verified creators and book them. One
account can be both a learner and a creator.

## Roles

- **learner** — default role for every account. Discovers creators, books
  sessions/workshops, tracks courses.
- **creator** — added on top of learner. Owns a public profile (`/c/[username]`),
  offerings, testimonials, payouts.
- **admin** — platform administration (Better Auth admin plugin).

Roles are stored as a comma string on the user (`"learner"` or `"learner,creator"`).

## Core User Flows

**Learner:** sign up → (optional onboarding: goal + interests) → discover via
`/top-creators` (niche-based) → view `/c/[username]` profile → book an offering →
learner dashboard.

**Creator:** land on `/creators` (creator-features marketing) → sign up / add
creator role → 4-step creator onboarding
(profile → bio+socials → banner+languages → first offering + go-live) →
creator dashboard (`/dashboard`, offers, bookings, payouts, analytics…).

## Features

### Discovery & Public
- `/` — main landing for learners / any user
- `/creators` — creator-features / "become a creator" landing page
- `/top-creators` + `/top-creators/[slug]` — niche-based top-creators discovery
- `/c/[username]` — public creator profile (offerings, testimonials, FAQ)

### Creator
- Multi-step onboarding, profile editing, offerings, testimonials
- Dashboard: analytics, bookings, calendar, payouts, auto-DM, priority-DM, CQS

### Learner
- Dashboard: sessions, workshops, courses, resources, notes, bookmarks, downloads

### Auth
- Email/password + Google OAuth (Better Auth), role-based routing, discovery boost

## Scope

### In scope
- Two-sided creator/learner platform, onboarding, public profiles, RBAC, booking surfaces

### Out of scope (currently mocked or not built)
- Real payments/payouts processing, live video, the learner dashboard data
  (currently mock data in `dal/learner.dal.ts`), messaging/DM backends

## Success Criteria
1. A user can sign up, onboard as creator, go live, and appear at `/c/[username]`.
2. A learner can discover creators via `/top-creators` and reach a `/c/[username]` profile.
3. Role-gated routes are enforced server-side; no protected page renders for the wrong role.
