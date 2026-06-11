import type { OfferType } from './offer'

export type BookingStatus = 'upcoming' | 'confirmed' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  learnerName: string
  learnerInitials: string
  offerTitle: string
  offerType: OfferType
  date: string
  time: string
  price: number
  status: BookingStatus
  rated: boolean
  rating?: number
}
