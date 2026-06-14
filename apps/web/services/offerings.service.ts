import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { CreatorOffering, CreatorOfferStats, OfferCreationEligibility, OfferStatus, OfferType } from '@creonex/types'

export interface CreateOfferingBody {
  type: OfferType
  title: string
  description?: string
  /** Price in whole INR (rupees) — API converts to paise */
  price: number
  durationMinutes?: number
  seatsTotal?: number
  minNoticeMinutes?: number
  bookingWindowDays?: number
  bufferAfterMinutes?: number
}

export type UpdateOfferingBody = Partial<Omit<CreateOfferingBody, 'type'>>

export const offeringsService = {
  getMyOfferings: (cookieHeader?: string) =>
    api.get<CreatorOffering[]>(endpoints.offerings.me, { cookieHeader }),

  getMyOfferingStats: (cookieHeader?: string) =>
    api.get<CreatorOfferStats>(endpoints.offerings.stats, { cookieHeader }),

  getEligibility: (cookieHeader?: string) =>
    api.get<OfferCreationEligibility>(endpoints.offerings.eligibility, { cookieHeader }),

  getOffering: (id: string, cookieHeader?: string) =>
    api.get<CreatorOffering>(endpoints.offerings.byId(id), { cookieHeader }),

  createOffering: (body: CreateOfferingBody) =>
    api.post<CreatorOffering>(endpoints.offerings.create, body),

  updateOffering: (id: string, body: UpdateOfferingBody) =>
    api.patch<CreatorOffering>(endpoints.offerings.byId(id), body),

  transitionStatus: (id: string, status: OfferStatus) =>
    api.patch<{ id: string; status: OfferStatus }>(endpoints.offerings.status(id), { status }),

  /** Hard delete — API only allows it for a draft with no bookings, else 409. */
  deleteOffering: (id: string) =>
    api.delete<{ id: string; deleted: true }>(endpoints.offerings.byId(id)),
}
