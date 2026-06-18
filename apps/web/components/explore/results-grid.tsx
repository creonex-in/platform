import type { ExploreItem, OfferType } from '@creonex/types'
import { ExploreCard } from './explore-card'

const GROUPS: { type: OfferType; label: string }[] = [
  { type: 'one_on_one', label: '1:1 Sessions' },
  { type: 'live_event', label: 'Live & Workshops' },
  { type: 'digital', label: 'Digital Resources' },
]

/** Results rendered as per-type sections, each a uniform sub-grid (no ragged spans). */
export function ResultsGrid({ items }: { items: ExploreItem[] }) {
  const sections = GROUPS.map((g) => ({
    ...g,
    items: items.filter((i) => i.type === g.type),
  })).filter((s) => s.items.length > 0)

  // Single-type result set → drop the section headings, just show one clean grid.
  if (sections.length <= 1) {
    return <CardGrid items={items} />
  }

  return (
    <div className="space-y-10">
      {sections.map((s) => (
        <section key={s.type}>
          <div className="mb-4 flex items-baseline gap-2">
            <h2 className="text-h4 font-bold tracking-tight">{s.label}</h2>
            <span className="text-body-sm text-muted-foreground">{s.items.length}</span>
          </div>
          <CardGrid items={s.items} />
        </section>
      ))}
    </div>
  )
}

function CardGrid({ items }: { items: ExploreItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ExploreCard key={item.id} item={item} className="h-full" />
      ))}
    </div>
  )
}
