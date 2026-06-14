# Progress Tracker

## Phase
Backend complete. Next: web booking flow.

## Done

**Infrastructure**
- Monorepo, Auth (Better Auth + Google + RBAC), global error handling, Font Awesome enforced

**Onboarding + Profiles**
- Creator 4-step onboarding, username availability check, public profile `/c/[username]` (redesigned)
- Creator/learner dashboards (learner data mocked)

**Schema** (migrations 0001–0004 applied)
- Tables: schedules, schedule_rules, schedule_overrides, calendar_connections, bookings
- Partial unique index: `uq_bookings_active_slot` (race guard)

**API Modules**
| Module | Status |
|---|---|
| OfferingsModule | ✅ CRUD + status state machine |
| AvailabilityModule | ✅ RRULE slots + freebusy + learner-tz |
| CalendarModule | ✅ Google OAuth + AES-256-GCM token + auto-refresh |
| MeetingModule | ✅ Provider abstraction + GoogleMeetProvider |
| PaymentModule | ✅ Razorpay lazy-init + order/verify/webhook/refund |
| BookingsModule | ✅ Full lifecycle: create → confirm → cancel |

## Next Up (web layer)

1. Slot picker UI → checkout → Razorpay modal → confirm
2. `/creator/availability` — schedule builder (RRULE + overrides)
3. `/creator/bookings` — creator view
4. Learner booking history

## Blocked / Needs Config
- `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` — empty in `.env`
- Google Console: add callback URI, enable Calendar API

## Key Decisions
- Prices in paise (DB), INR (API)
- Bookings UTC, slots in learner tz
- Razorpay lazy-init commit `9f5c942` — revert if payment breaks
- Learner profile auto-created on first booking
- `parseRoles()` always, never `.split(',')`
