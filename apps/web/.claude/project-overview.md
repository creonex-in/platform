# Project Overview — Creonex

## What is Creonex?

Creonex is an **Indian creator-education marketplace** connecting learners with India's top creators for structured courses and live 1-on-1 mentorship sessions.

Think of it as the intersection of:
- **Cohort-based learning** (structured, creator-led)
- **Expert marketplace** (book a session directly with a verified creator)
- **Niche focus** (design, tech, marketing, content, finance — creator economy adjacent skills)

---

## Target Audience

**Learners:**
- Age 18–35, tier 1–2 Indian cities
- Aspiring creators, career changers, students building portfolios
- Mobile-first behavior (60%+ mobile traffic expected)
- Price-sensitive — freemium discovery, paid gated content

**Creators (supply side):**
- Micro to mid-tier Indian creators (10K–1M followers)
- Already have audiences but no structured monetization product
- Looking for a platform to sell knowledge without building their own LMS

---

## Core Features (MVP scope)

| Feature | Status |
|---------|--------|
| Homepage (marketing shell) | ✅ Built |
| Course listing + filters | 🔲 Planned |
| Course detail page | 🔲 Planned |
| Expert profiles | 🔲 Planned |
| Expert listing | 🔲 Planned |
| Authentication (login/signup) | 🔲 Planned |
| User onboarding flow | 🔲 Planned |
| 1-on-1 session booking | 🔲 Planned |
| User dashboard | 🔲 Planned |
| Payments (Razorpay) | 🔲 Planned |
| Creator dashboard | 🔲 Post-MVP |
| Course creation (CMS) | 🔲 Post-MVP |
| Reviews & ratings | 🔲 Post-MVP |
| Notifications | 🔲 Post-MVP |

---

## Business Model

1. **Course sales**: Platform takes 20% cut from course revenue
2. **Mentorship sessions**: Platform takes 15% cut from session fees
3. **Creator Pro**: Monthly subscription for creators with analytics + priority listings (Post-MVP)
4. **Brand deals** (future): Sponsored placements

---

## Tech Vision

**Frontend goals:**
- Production-quality, performant, accessible
- Sub-2.5s LCP on mobile 4G
- Zero client-side state until user interaction (maximum Server Components)
- Incrementally adoptable — can add new feature slices without refactoring existing code
- Developer experience: fast hot reload, strict types, zero-ambiguity folder structure

**Backend (separate repo):**
- NestJS REST API
- Neon PostgreSQL (serverless Postgres)
- Drizzle ORM
- Razorpay payment integration
- Clerk for authentication (hosted UI + session management)

---

## Competitive Positioning

| Platform | Problem | Creonex Advantage |
|---------|---------|-------------------|
| Udemy / Unacademy | Crowded, commoditized, no creator brand | Creator-first, niche expertise |
| Topmate / Mentro | Session booking only, no courses | Integrated course + mentorship |
| YouTube / Instagram | Free but no structure | Paid, structured, accountable |
| Maven | US-focused, cohort-only | India-native, async + sync |

---

## Repository Conventions

- This repo: **frontend only** (`web/`)
- Backend repo: separate (NestJS — contact team lead for access)
- Design source: Figma file `RpnOkkAMw3S4VsZUjyIASy` (Creonex Main)
- Deployments: Vercel (frontend)

---

## Team

| Role | Person |
|------|--------|
| Frontend Dev | chandranimaheswari |
| Design | Figma file (RpnOkkAMw3S4VsZUjyIASy) |
| Backend | TBD |
