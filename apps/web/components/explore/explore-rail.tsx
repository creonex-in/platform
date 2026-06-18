import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import type { ExploreItem } from '@creonex/types'
import { ExploreCard } from './explore-card'

interface ExploreRailProps {
  title: string
  /** Optional small line under the title. */
  subtitle?: string
  /** Optional "see all" deep-link (usually a pre-filtered /explore URL). */
  seeAllHref?: string
  items: ExploreItem[]
  /** Accent eyebrow shown above the title (e.g. "FOR YOU", "LIVE"). */
  eyebrow?: React.ReactNode
}

/** Horizontal, snap-scrolling rail of offering cards. Pure CSS scroll — no client JS. */
export function ExploreRail({ title, subtitle, seeAllHref, items, eyebrow }: ExploreRailProps) {
  if (items.length === 0) return null
  return (
    <section className="py-6">
      <div className="page-container flex items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
          )}
          <h2 className="text-h4 font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-body-sm mt-0.5 text-muted-foreground">{subtitle}</p>}
        </div>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="group flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            See all
            <FontAwesomeIcon icon={faArrowRight} className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="no-scrollbar mt-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-10">
        {items.map((item) => (
          <div key={item.id} className="w-[300px] shrink-0 snap-start sm:w-[330px]">
            <ExploreCard item={item} className="h-full" />
          </div>
        ))}
      </div>
    </section>
  )
}

/** Loading placeholder matching the rail's heading + card row. */
export function RailSkeleton() {
  return (
    <section className="py-6">
      <div className="page-container">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="no-scrollbar mt-4 flex gap-5 overflow-hidden px-4 pb-4 sm:px-6 lg:px-10">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-64 w-[300px] shrink-0 animate-pulse rounded-4xl bg-muted sm:w-[330px]" />
        ))}
      </div>
    </section>
  )
}
