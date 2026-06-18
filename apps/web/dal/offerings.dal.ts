import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { offeringsService } from '@/services/offerings.service'
import type { CreatorOffering, CreatorOfferStats, OfferCreationEligibility } from '@creonex/types'

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

// cache() — dedupes within a single request render.

/** All offerings owned by the authenticated creator (dashboard list). */
export const getMyOfferings = cache(async (): Promise<CreatorOffering[]> => {
  return offeringsService.getMyOfferings(await getCookieHeader())
})

/** Aggregate offer stats (counts, bookings, revenue) — server-computed. */
export const getMyOfferingStats = cache(async (): Promise<CreatorOfferStats> => {
  return offeringsService.getMyOfferingStats(await getCookieHeader())
})

/** Single offering by id (owner-only); null when not found. */
export const getOfferingById = cache(async (id: string): Promise<CreatorOffering> => {
  return offeringsService.getOffering(id, await getCookieHeader())
})

/** Whether the creator may create gated offer types (group / workshop). */
export const getOfferingEligibility = cache(async (): Promise<OfferCreationEligibility> => {
  return offeringsService.getEligibility(await getCookieHeader())
})
