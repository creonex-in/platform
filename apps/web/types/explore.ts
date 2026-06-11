export type ExploreTab =
  | 'all'
  | '1:1'
  | 'workshop'
  | 'group'
  | 'digital'
  | 'course'
  | 'community'
  | 'coaching_plan'

export type SortOption =
  | 'relevance'
  | 'top_rated'
  | 'price_asc'
  | 'price_desc'
  | 'newest'

export type ResponseTimeFilter = 'any' | 'under_1hr' | 'under_6hrs'

export interface ExploreFilters {
  priceMin: number
  priceMax: number
  minRating: number | null
  liveToday: boolean
  inBoost: boolean
  responseTime: ResponseTimeFilter
}

export const DEFAULT_FILTERS: ExploreFilters = {
  priceMin: 0,
  priceMax: 10000,
  minRating: null,
  liveToday: false,
  inBoost: false,
  responseTime: 'any',
}
