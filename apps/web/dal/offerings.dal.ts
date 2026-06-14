import 'server-only'
import { cookies } from 'next/headers'
import { offeringsService } from '@/services/offerings.service'
import type { CreatorOffering, CreatorOfferStats, OfferCreationEligibility } from '@creonex/types'

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

/** All offerings owned by the authenticated creator (dashboard list). */
export async function getMyOfferings(): Promise<CreatorOffering[]> {
  return offeringsService.getMyOfferings(await getCookieHeader())
}

/** Aggregate offer stats (counts, bookings, revenue) — server-computed. */
export async function getMyOfferingStats(): Promise<CreatorOfferStats> {
  return offeringsService.getMyOfferingStats(await getCookieHeader())
}

/** Single offering by id (owner-only); null when not found. */
export async function getOfferingById(id: string): Promise<CreatorOffering> {
  return offeringsService.getOffering(id, await getCookieHeader())
}

/** Whether the creator may create gated offer types (group / workshop). */
export async function getOfferingEligibility(): Promise<OfferCreationEligibility> {
  return offeringsService.getEligibility(await getCookieHeader())
}
