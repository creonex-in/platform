'use client'

import type { ExploreItem } from '@creonex/types'
import { CatalogCard, HorizontalListCard } from './learner-card'

export function OfferingsCarousel({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle?: string
  items: ExploreItem[]
}): React.ReactElement | null {
  if (!items || items.length === 0) return null

  // If there is only one offering card, render the premium HorizontalListCard full-width
  if (items.length === 1) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="w-full">
          <HorizontalListCard item={items[0]} className="w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative">
        <div className="no-scrollbar flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
          {items.map((item) => (
            <div key={item.id} className="w-64 sm:w-72 shrink-0 snap-start">
              <CatalogCard item={item} className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
