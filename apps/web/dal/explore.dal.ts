import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { exploreService, type BrowseParams } from '@/services/explore.service'
import { isUnauthorized } from '@/lib/api'
import type { BrowseOfferingsResponse } from '@creonex/types'

/** Public, cacheable browse/search. Cookie-free on purpose — keeps the anonymous
 *  render ISR-eligible (calling cookies() here would force dynamic rendering). */
export const browseOfferings = cache(
  (params: BrowseParams): Promise<BrowseOfferingsResponse> => exploreService.browse(params),
)

/** Personalized rail for the signed-in learner. Cookie-bound → dynamic. Returns an
 *  empty result (not an error) for anonymous visitors so the rail just renders nothing. */
export const getRecommendedOfferings = cache(async (): Promise<BrowseOfferingsResponse> => {
  const empty: BrowseOfferingsResponse = { items: [], total: 0, limit: 0, offset: 0 }
  try {
    const cookieHeader = (await cookies()).toString()
    if (!cookieHeader) return empty
    return await exploreService.recommended(cookieHeader)
  } catch (e) {
    if (isUnauthorized(e)) return empty
    throw e
  }
})
