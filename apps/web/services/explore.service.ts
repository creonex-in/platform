import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { BrowseOfferingsResponse } from '@creonex/types'

export interface BrowseParams {
  type?: string
  niche?: string
  q?: string
  sort?: string
  limit?: number
  offset?: number
}

function toQueryString(params: BrowseParams): string {
  const sp = new URLSearchParams()
  if (params.type && params.type !== 'all') sp.set('type', params.type)
  if (params.niche && params.niche !== 'all') sp.set('niche', params.niche)
  if (params.q) sp.set('q', params.q)
  if (params.sort && params.sort !== 'relevance') sp.set('sort', params.sort)
  if (params.limit != null) sp.set('limit', String(params.limit))
  if (params.offset) sp.set('offset', String(params.offset))
  return sp.toString()
}

export const exploreService = {
  /** Public browse/search — cacheable (ISR). Never pass a cookie header here. */
  browse: (params: BrowseParams) =>
    api.get<BrowseOfferingsResponse>(endpoints.explore.browse(toQueryString(params)), {
      next: { revalidate: 60, tags: ['explore'] },
    }),

  /** Personalized rail — cookie-bound, per learner. */
  recommended: (cookieHeader?: string) =>
    api.get<BrowseOfferingsResponse>(endpoints.explore.recommended, { cookieHeader }),
}
