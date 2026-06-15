// ── Payouts / KYC / Razorpay Route ─────────────────────────────────────────────

/** Per-booking earnings ledger row status. */
export const LEDGER_STATUSES = [
  'pending',   // transfer not yet created
  'held',      // transfer created but on_hold (refund window / unverified KYC)
  'settled',   // released / settled to the creator
  'reversed',  // refunded/cancelled — transfer reversed
] as const

/** Settlement/payout history row status. */
export const PAYOUT_STATUSES = [
  'pending', 'processing', 'paid', 'failed',
] as const

/** Creator legal entity type for the linked-account KYC. */
export const PAYOUT_ENTITY_TYPES = [
  'individual', 'proprietorship', 'partnership', 'private_limited', 'llp',
] as const

/** Platform commission default, in basis points (1000 = 10%). Configurable via
 *  PLATFORM_FEE_BPS env on the API; this is the fallback. Decide final value before launch. */
export const DEFAULT_PLATFORM_FEE_BPS = 1000

export type LedgerStatus = typeof LEDGER_STATUSES[number]
export type PayoutStatus = typeof PAYOUT_STATUSES[number]
export type PayoutEntityType = typeof PAYOUT_ENTITY_TYPES[number]

// ── Requests / responses ───────────────────────────────────────────────────────

/** Creator submits KYC + bank → creates/updates the Razorpay linked account. */
export interface SubmitKycRequest {
  legalName: string
  entityType: PayoutEntityType
  phone: string
  pan: string
  bankAccountNumber: string
  bankIfsc: string
  accountHolderName: string
}

/** Current KYC + payout-eligibility state for the creator. */
export interface KycStatusResponse {
  status: string            // creatorProfiles.kycStatus
  payoutsEnabled: boolean
  /** Present once submitted; bank account number is masked. */
  account: {
    legalName: string
    entityType: PayoutEntityType
    maskedAccount: string
    bankIfsc: string
    accountHolderName: string
  } | null
}

/** Aggregate earnings derived from the ledger (paise). */
export interface CreatorEarnings {
  /** Settled + released to the creator (or in Razorpay's settlement pipeline). */
  availablePaise: number
  /** Created but on_hold (refund window not passed). */
  heldPaise: number
  /** Earned but not yet transferred (e.g. KYC pending). */
  pendingPaise: number
  lifetimeGrossPaise: number
  lifetimeNetPaise: number
}

/** One ledger row for the creator's earnings history. */
export interface LedgerEntryItem {
  id: string
  bookingId: string
  offeringTitle: string | null
  grossPaise: number
  platformFeePaise: number
  netPaise: number
  status: LedgerStatus
  createdAt: string
}

/** One settlement/payout to the creator's bank. */
export interface PayoutItem {
  id: string
  amountPaise: number
  status: PayoutStatus
  utr: string | null
  createdAt: string
}
