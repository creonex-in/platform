export type OfferType = '1:1' | 'workshop' | 'group' | 'digital' | 'community' | 'coaching_plan'
export type OfferStatus = 'live' | 'draft' | 'scheduled' | 'ended'

export interface Offer {
  id: string
  type: OfferType
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
