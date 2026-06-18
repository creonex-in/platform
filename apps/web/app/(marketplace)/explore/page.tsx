import type { Metadata } from 'next'
import { Suspense } from 'react'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import type { OfferType } from '@creonex/types'
import { browseOfferings } from '@/dal/explore.dal'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { ExploreHero } from '@/components/explore/explore-hero'
import { ExploreFilterBar } from '@/components/explore/explore-filter-bar'
import { ActiveFilters } from '@/components/explore/active-filters'
import { ResultsGrid } from '@/components/explore/results-grid'
import { ExplorePager } from '@/components/explore/explore-pager'
import { RailSkeleton } from '@/components/explore/explore-rail'
import {
  RecommendedRail, LiveRail, TrendingRail, NicheRail,
} from '@/components/explore/explore-rails'

export const metadata: Metadata = {
  title: 'Explore — Creonex',
  description: "Discover 1:1 sessions, live workshops, and digital resources from India's top creators.",
}

const PAGE_SIZE = 24

/** UI filter token → API offer-type enum. */
const TYPE_TO_API: Record<string, 'all' | OfferType> = {
  all: 'all',
  '1on1': 'one_on_one',
  live: 'live_event',
  digital: 'digital',
}

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; niche?: string; sort?: string; page?: string }>
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const q = (sp.q ?? '').trim()
  const type = sp.type ?? 'all'
  const niche = sp.niche ?? 'all'
  const sort = sp.sort ?? 'relevance'
  const page = Math.max(1, Number(sp.page) || 1)

  const isResults = Boolean(q) || type !== 'all' || niche !== 'all' || sort !== 'relevance' || page > 1

  // ── Browse state — editorialized rails (each streams independently) ───────────
  if (!isResults) {
    return (
      <div className="min-h-dvh pb-20">
        <ExploreHero />
        <Suspense fallback={<RailSkeleton />}><RecommendedRail /></Suspense>
        <Suspense fallback={<RailSkeleton />}><LiveRail /></Suspense>
        <Suspense fallback={<RailSkeleton />}><TrendingRail /></Suspense>
        <Suspense fallback={<RailSkeleton />}><NicheRail niche="coding_dsa" /></Suspense>
        <Suspense fallback={<RailSkeleton />}><NicheRail niche="design_creative" /></Suspense>
      </div>
    )
  }

  // ── Results state — grouped, ranked, paginated ────────────────────────────────
  const apiType = TYPE_TO_API[type] ?? 'all'
  const { items, total } = await browseOfferings({
    type: apiType,
    niche,
    q: q || undefined,
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

  const pagerParams = {
    q: q || undefined,
    type: type !== 'all' ? type : undefined,
    niche: niche !== 'all' ? niche : undefined,
    sort: sort !== 'relevance' ? sort : undefined,
  }

  return (
    <div className="min-h-dvh">
      {/* Page header */}
      <div className="border-b border-border/50 bg-background">
        <div className="page-container py-5">
          <p className="text-label">{q ? 'Search results' : 'Marketplace'}</p>
          <h1 className="text-h3 mt-0.5">{q ? `“${q}”` : 'Explore creators & offerings'}</h1>
        </div>
      </div>

      {/* Sticky filter + sort bar (sits below the 60px discovery header) */}
      <div className="sticky top-[60px] z-40 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="page-container space-y-3 py-3">
          <ExploreFilterBar activeType={type} activeNiche={niche} activeSort={sort} />
          <ActiveFilters q={q} type={type} niche={niche} sort={sort} />
        </div>
      </div>

      <div className="page-container py-6 pb-20">
        <p className="text-body-sm">
          {total > 0 ? `Showing ${from}–${to} of ${total}` : 'No results'}
          {q && <> for &ldquo;<span className="font-medium text-foreground">{q}</span>&rdquo;</>}
        </p>

        {items.length > 0 ? (
          <>
            <div className="mt-5">
              <ResultsGrid items={items} />
            </div>
            <ExplorePager page={page} totalPages={totalPages} params={pagerParams} />
          </>
        ) : (
          <>
            <EmptyState
              icon={faMagnifyingGlass}
              title="Nothing found"
              description="Try a broader filter or a different search term — or explore what's popular below."
            />
            {/* Zero-result recovery — never a dead end. */}
            <Suspense fallback={<RailSkeleton />}><TrendingRail /></Suspense>
          </>
        )}
      </div>
    </div>
  )
}
