# Creator Payouts, KYC & Razorpay Route

> How a learner's payment reaches the creator's bank, how the platform takes its cut, and how
> KYC gates payouts. Companion to `offerings-type-flows.md`. **Money-critical — security-first.**

---

## 1. Why this exists

Today every payment is captured into the **single platform Razorpay account** and stays there —
creators are never paid. `creatorProfiles.kycStatus` exists but is never set; there are no bank/KYC
fields, no linked accounts, no split logic, and no payout/earnings/ledger tables. The `/payouts`
page is pure mock. This document defines real money movement: split each sale so the creator's
share reaches their bank, the platform keeps a commission, and KYC gates when funds are released.

## 2. Decisions (locked)

- **Model = Razorpay Route.** Creators are **linked sub-merchant accounts**; their share is legally
  theirs, settled to their bank by Razorpay. The platform never custodies creator funds (avoids
  India PA/escrow regulatory exposure).
- **Platform absorbs the Razorpay PG fee + GST** out of its commission → creators get a clean
  "you keep X%" promise.
- **Commission % is configurable**, exact number TBD; **snapshotted per booking** so rate changes
  never rewrite history.
- **Sell-now, payouts-held-until-KYC.** Creators publish + take bookings immediately; earnings
  accrue but transfers/settlement are **held** until KYC + bank are verified.

## 3. How Razorpay Route works

1. Each creator → a **Linked Account** (sub-merchant) under the platform account, created via API
   with KYC + bank details; has its own activation/KYC status.
2. Learner pays → captured on the **platform** account (as today).
3. On confirm, platform creates a **Transfer** splitting the payment: platform keeps commission,
   rest goes to the creator's linked account. Transfer can be **`on_hold`** until a release date
   (refund window / pending KYC).
4. Razorpay **settles** the linked account balance to the **creator's bank** on schedule.
5. Refund = **reverse the transfer** + refund the learner.

> ⚠️ Razorpay Route endpoints, linked-account fields, webhook event names, and transfer/reversal
> APIs must be verified against current Razorpay docs at build time — they change. This doc fixes
> the architecture, not exact signatures.

## 4. Money math (per booking)

```
gross         = booking.amountPaise                  learner pays
platformFee   = round(gross * feeBps / 10000)        commission (configurable)
creatorShare  = gross - platformFee                  transferred to creator linked acct
platform net  = platformFee - razorpayPgFee - gst    platform absorbs PG fee + GST
```

`feeBps` (basis points) is configurable. Each ledger row **snapshots `feeBps` + computed amounts**.
PG fee + GST are platform cost, never deducted from `creatorShare`.

## 5. Data model

- **`creatorProfiles`** (extend): `razorpayAccountId`, `payoutsEnabled` (true once KYC verified).
  Reuse `kycStatus`.
- **`creator_payout_accounts`** (new, 1:1) — KYC/bank PII isolated: legal name, entity type, PAN,
  bank account no, IFSC, account holder, status, timestamps.
- **`creator_ledger`** (new — source of truth): `id, creatorProfileId, bookingId, grossPaise,
  platformFeePaise, feeBps, netPaise, razorpayTransferId, status (pending|held|settled|reversed),
  createdAt`. Earnings/balance UI derives from this.
- **`payouts`** (new — settlement history for UI): mirrors Razorpay settlement/transfer events via
  webhook.

## 6. API

- **`PaymentService`**: `createTransfer(paymentId, linkedAccountId, amountPaise, {onHold, releaseAt})`,
  `reverseTransfer(transferId, amountPaise)`. **Idempotent per booking** (key on `bookingId`).
- **`BookingsService.confirm`**: after payment verified → compute fee, create transfer to creator
  linked account (`on_hold` while inside refund window OR creator unverified), write `creator_ledger`
  row. `cancel`/refund → reverse transfer + reverse ledger row.
- **`KycModule`** (creator): submit KYC + bank → create/patch linked account → store
  `razorpayAccountId`; GET status. Webhook for account-activated/KYC → update `kycStatus` +
  `payoutsEnabled` + release held transfers.
- **`PayoutsModule`** (creator): GET earnings/balance (ledger: pending vs held vs settled), GET
  payout/settlement history.
- Webhook controller: extend beyond `payment.captured` to settlement + linked-account + transfer events.

## 7. Web

- **KYC + bank capture form** — creator `/settings` (or `/payouts/setup`): legal name, PAN, bank
  account + IFSC + holder, via new `payouts.service`/`dal` → KycModule. shadcn components.
- **`/payouts` page → fully dynamic**: balance (settled / held / pending from ledger), upcoming
  settlement, functional KYC gate banner, real history. Delete `mock-payouts.ts`.
- KYC prompt surfaced on dashboard + payouts until verified.

## 8. Security & edge cases (non-negotiable for money)

- **Server-derived amounts only** — never trust client for price/fee/share.
- **Idempotent transfers** — one per booking; safe under webhook retries + double confirm.
- **Webhook signature verification** on the raw body; idempotent event handling.
- **KYC/bank PII** isolated in its own table, access-controlled, never exposed on public/learner APIs.
- **Audit ledger** is the source of truth; every state change recorded.
- Transfer **`on_hold`** until refund window passes → auto-release. Refund before release = simple
  reverse; after release = reverse from linked-account balance (can go negative → clawback handling).
- KYC unverified at sale → hold; release on verification.
- **Reconciliation job** (ledger ↔ Razorpay). Creator changes bank → re-verify. Partial refunds,
  chargebacks, settlement-timing, negative balance all handled explicitly.
- **GST on platform commission** (service fee) → finance/CA review; may need tax invoices.

## 9. Build phases

1. Schema + `creator_ledger` + payout-account + linked-account columns.
2. KYC + bank capture UI + linked-account create + status webhook.
3. Transfer-on-confirm + reverse-on-refund + ledger writes + hold/release.
4. Dynamic `/payouts` page + earnings/balance/history endpoints.
5. Webhooks (settlement/account) + reconciliation + GST handling.

## 10. Still open

- Exact **commission %** (configurable; pick before launch).
- **Refund-window length** per type (drives transfer hold/release).
- **KYC capture mode**: in-app form → API linked-account create (recommended) vs Razorpay-hosted
  onboarding link. Recommend in-app; confirm.
- Legal/GST review of marketplace fee + tax invoicing.

## 11. Verification (test mode)

Razorpay test mode: create a test linked account → book → confirm → Transfer appears (platform fee
kept, creator share transferred) → refund → reversal → KYC/activation webhook flips
`kycStatus`/`payoutsEnabled` and releases held transfers → `/payouts` reflects ledger balances.
Plus `pnpm type-check` both apps.

## 12. Blockers — before payouts move real money

Status: code scaffolded + type-checks clean. NOT yet payout-functional. Order = critical path.

**Owner: you (config — nothing charges/transfers without these)**
1. **Razorpay keys** — `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` in `apps/api/.env` + web
   `NEXT_PUBLIC_RAZORPAY_KEY_ID`. Empty now → even base booking payment throws.
2. **Enable Route** on the platform Razorpay account (request via dashboard/support). Without it,
   `accounts.create` + `transfers` fail.
3. **Configure webhook** — URL + secret; subscribe `payment.captured` + `account.*` (+ settlement).

**Owner: build (me)**
4. **Linked-account onboarding steps 2–3** — SDK v2.9.6 `accounts.create` only makes a shell
   account. To actually settle to the creator's bank, still need: (a) **stakeholder** creation,
   (b) **product configuration** (`/accounts/{id}/products`) that enables Route + attaches the
   **settlement bank** (acct no + IFSC). Not in the typed SDK → raw-HTTP calls (typed at our
   boundary). Without this, transfers have nowhere to settle. Bank details already captured at KYC.
5. **(Optional) settlement webhook → `payouts` table** — populate settlement history rows for the
   `/payouts` UI (currently the table exists but nothing writes to it).

**Owner: you (product / finance decisions)**
6. Final **commission %** (`PLATFORM_FEE_BPS`).
7. **Refund-window** policy — transfers currently settle immediately (`on_hold:false`); a refund
   after settlement may fail to reverse. Decide hold window → set `on_hold` + release on expiry.
8. **GST/tax invoicing** on the commission — CA review.

**Critical path to "money reaches creator's bank":** 1 → 2 → 4 → (3 for webhook activation) → 6.
Items 4–5 buildable now; 1–3 are config; verify end-to-end in Razorpay test mode (§11).
