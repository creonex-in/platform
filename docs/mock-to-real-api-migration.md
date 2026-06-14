# Mock → Real API Migration Plan

Complete list of pages/components using mock data, mapped to the real APIs built in the backend.
Work in order — each section is a self-contained unit.

---

## 1. Creator Offers (`/creator/offers`)

**Current state:** `mock-offers.ts` → `<OfferItem>` list.  
`/creator/offers/new` imports `<OfferForm />` that **does not exist** → page is broken.

### APIs ready

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/offerings/me` | List creator's offers |
| `POST` | `/api/v1/offerings` | Create offer |
| `GET` | `/api/v1/offerings/:id` | Get single offer |
| `PATCH` | `/api/v1/offerings/:id` | Edit offer |
| `PATCH` | `/api/v1/offerings/:id/status` | Transition status (draft→live→paused→archived) |

### What to build

- Convert `offers/page.tsx` from `'use client'` + mock → server component + `GET /api/v1/offerings/me`
- New `services/offerings.service.ts` + `dal/offerings.dal.ts`
- Build `components/dashboard/creator/offer-form.tsx` — fields: type, title, description, price, durationMinutes, seatsTotal, minNoticeMinutes, bookingWindowDays, bufferAfterMinutes
- `offer-form` calls `POST /api/v1/offerings` on submit → redirect to `/creator/offers`
- Add publish/pause/archive toggle on `<OfferItem>` → `PATCH /api/v1/offerings/:id/status`
- Add edit flow: `/creator/offers/[id]/edit` → pre-fill form → `PATCH /api/v1/offerings/:id`
- **Delete** `mock-offers.ts` when done

### OfferType values (from `@creonex/types`)
`one_on_one | workshop | group | digital` — only these 4 are supported by the API.  
`community` and `coaching_plan` in the mock do not exist in the backend schema — do not expose.

**V1 booking scope:** Only `one_on_one` and `group` support slot-based booking.  
`workshop` and `digital` offers are created/listed but have no booking flow yet.

---

## 2. Creator Bookings (`/creator/bookings`)

**Current state:** `mock-bookings.ts` → flat list.

### APIs ready

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/creator/bookings/offerings/:offeringId` | All bookings for one offering |
| `POST` | `/api/v1/creator/bookings/:id/cancel` | Creator cancels + refunds |

**Gap:** No `GET /api/v1/creator/bookings/all` endpoint. Current API is per-offering.  
**Fix needed (API):** Add `GET /api/v1/creator/bookings` that returns all bookings across all offerings, paginated.

### What to build

- Add `GET /api/v1/creator/bookings` endpoint to API (flat list, all offerings, sorted by scheduledAt desc)
- Convert `bookings/page.tsx` to server component → `getCreatorBookings()` DAL
- Replace mock `Booking` type shape with real API response shape
- Add cancel action on each `<BookingRow>` → `POST /api/v1/creator/bookings/:id/cancel`
- **Delete** `mock-bookings.ts` when done

---

## 3. Learner Sessions (`/learner/(dashboard)/sessions`)

**Current state:** `mock-purchases.ts` → `<SessionRow>` list.

### APIs ready

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/bookings/me` | Learner's own bookings |
| `POST` | `/api/v1/bookings/:id/cancel` | Learner cancels |

### What to build

- Convert `sessions/page.tsx` to server component + real `GET /api/v1/bookings/me`
- Add `services/bookings.service.ts` + `dal/bookings.dal.ts`
- Update `<SessionRow>` to use real booking shape (has `meetUrl`, `scheduledAt`, `status`)
- Show Meet link button when `meetUrl` present and status is `confirmed`
- Add cancel button → `POST /api/v1/bookings/:id/cancel`
- **Delete** `mock-purchases.ts` when done

---

## 4. Booking Flow (slot picker → checkout → Razorpay → confirm)

**Current state:** `BookSessionBar` on `/c/[username]` scrolls to `#offerings` anchor. No real flow.

**Scope for v1:** Only `one_on_one` and `group` offer types support slot-based booking.  
`workshop` and `digital` have no slot picker — skip for now.

### APIs ready

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/availability/offerings/:offeringId/slots?timezone=&from=&to=` | Available slots |
| `POST` | `/api/v1/bookings` | Create booking + get Razorpay `orderId` |
| `POST` | `/api/v1/bookings/:id/confirm` | Verify Razorpay signature + confirm |

---

### Flow A — Creator has Google Calendar connected

Creator has synced Google Calendar. The slot generation service checks freebusy against the creator's real calendar — booked/busy slots are automatically excluded.

```
Learner clicks "Book" on a one_on_one / group offering card
  → SlotPickerModal opens
    Step 1 — Date picker
      → fetch slots: GET /api/v1/availability/offerings/:offeringId/slots
                     ?timezone=Asia/Kolkata&from=2026-06-14&to=2026-06-21
      → backend: generates slots from schedule rules, filters out:
          - already-booked slots (DB)
          - Google Calendar busy intervals (live freebusy call)
      → UI shows available time slots; busy/booked slots are hidden
      → learner picks a slot

    Step 2 — Confirm & Pay
      → summary card: offer name · date/time (learner's timezone) · price
      → "Pay ₹XXX" button
        → POST /api/v1/bookings { offeringId, scheduledAt }
        → returns { bookingId, razorpayOrderId, amount, currency }
        → Razorpay JS SDK modal opens (in-page, not redirect)

    Step 3 — Razorpay success callback
      → POST /api/v1/bookings/:id/confirm { razorpayPaymentId, razorpayOrderId, razorpaySignature }
      → backend: verifies signature, creates Google Meet event on creator's calendar,
                 emails/notifies both parties
      → returns { booking, meetUrl }

    Step 4 — Success screen
      → "Booking confirmed!"
      → Google Meet link shown + copyable
      → "Add to Google Calendar" deep-link
```

---

### Flow B — Creator has NOT connected Google Calendar

Creator has only set availability hours (schedule rules) but no Google Calendar linked. No freebusy check — slots are based purely on schedule rules + existing bookings in DB.

```
Learner clicks "Book"
  → SlotPickerModal opens
    Step 1 — Date picker
      → fetch slots: GET /api/v1/availability/offerings/:offeringId/slots
      → backend: generates slots from schedule rules, filters out already-booked slots
        (no Google freebusy — calendar not connected, backend handles gracefully)
      → UI shows available slots same as Flow A

    Step 2 — Confirm & Pay
      → same as Flow A

    Step 3 — Razorpay success callback
      → POST /api/v1/bookings/:id/confirm
      → backend: verifies payment, marks confirmed
        (no Google Meet event created — calendar not connected)
      → returns { booking, meetUrl: null }

    Step 4 — Success screen
      → "Booking confirmed!"
      → No Meet link — shows: "Creator will share session details separately"
      → Option to message creator (future feature placeholder)
```

---

### Edge cases to handle

- **No slots available** — all days blocked or no schedule set → show "No availability for this period. Try a different week."
- **Group offer full** — `seatsLeft === 0` → "Booking" button disabled, show "Sold out"
- **Payment failure** — Razorpay modal closed/failed → booking stays in `pending` state, learner can retry from `/learner/sessions`
- **Webhook backup** — if confirm API call fails but Razorpay webhook fires → `POST /api/v1/payments/webhook` auto-confirms the booking (already built)

### What to build

- `app/c/[username]/_components/slot-picker-modal.tsx` — 4-step modal (`date → slot → checkout → success`)
- `services/slots.service.ts` — `getSlots(offeringId, tz, from, to)`
- Load Razorpay JS SDK (`https://checkout.razorpay.com/v1/checkout.js`) in modal
- Pass `NEXT_PUBLIC_RAZORPAY_KEY_ID` env var to frontend
- Update `<OfferingCard>` "Book" button — only show for `one_on_one` and `group` types; opens modal
- `digital` and `workshop` offer cards → no Book button for now (or show "Coming soon")

### Env vars needed
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...   # apps/web .env.local
RAZORPAY_KEY_ID=rzp_test_...               # apps/api .env
RAZORPAY_KEY_SECRET=...                    # apps/api .env
RAZORPAY_WEBHOOK_SECRET=...               # apps/api .env
```

---

## 5. Public Creator Profile (`/c/[username]`) — Offerings Section

**Current state:** Offerings section on public profile — check if still using mock.

### What to check / build

- Verify `offerings-section.tsx` fetches real offerings from API (public endpoint needed)
- API may need `GET /api/v1/offerings/public/:username` or offerings returned as part of the creator profile response
- Only `live`-status offerings should appear on public profile

---

## Mocks to keep (no API built yet — leave as-is)

| Mock file | Used by | Status |
|-----------|---------|--------|
| `mock-collab.ts` | `/creator/collaborate` | No API — keep |
| `mock-courses.ts` | `/learner/courses` | No API — keep |
| `mock-earnings.ts` | `/creator/analytics` | No API — keep |
| `mock-payouts.ts` | `/creator/payouts` | No API — keep |
| `mock-resources.ts` | `/learner/resources` | No API — keep |
| `mock-creators.ts` | Landing/discovery pages | No API — keep |
| `mock-creator-tools.ts` | `mockCreatorTestimonials`, `analyticsSummary`, `topOffers` | No API — keep remaining exports |

---

## Execution Order

```
1. Offerings list + OfferForm (unblocks everything — creator needs live offers to test bookings)
2. Add GET /api/v1/creator/bookings endpoint (backend gap)
3. Creator bookings page (real data)
4. Learner sessions page (real data)
5. Slot picker + Razorpay booking flow (biggest chunk — needs Razorpay keys configured)
6. Public profile offerings section audit
```
