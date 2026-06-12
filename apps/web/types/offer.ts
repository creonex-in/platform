import type { OfferType as ApiOfferType, OfferStatus as ApiOfferStatus } from '@creonex/types'

// Canonical backend types re-exported for convenience
export type { ApiOfferType as OfferType }

// UI-only offer status (extends backend statuses with scheduled/ended for display)
export type OfferStatus = ApiOfferStatus | 'scheduled' | 'ended'

// UI-only extended offer type (includes future types not yet in backend)
export type OfferDisplayType = ApiOfferType | 'community' | 'coaching_plan'

export interface Offer {
  id: string
  type: OfferDisplayType
  title: string
  description: string
  price: number
  status: OfferStatus
  bookings: number
  rating: number
  date?: string
  seats?: number
  seatsLeft?: number
  duration: number
  createdAt: string
  image?: string
  memberCount?: number
  billingCycle?: 'monthly' | 'quarterly' | 'yearly'
  sessionCount?: number
  programDuration?: string
}
