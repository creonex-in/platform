import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { NICHE_OPTIONS } from '@/constants/onboarding'
import { FEATURED_NICHES } from '@/lib/niche'

const FEATURED = NICHE_OPTIONS.filter((n) => (FEATURED_NICHES as readonly string[]).includes(n.value as string))

/** Top-of-page hero for the browse state — sets the discovery tone + quick niche entry. */
export function ExploreHero() {
  return (
    <section className="border-b border-border/50 bg-gradient-to-b from-muted/40 to-background">
      <div className="page-container py-10 sm:py-14">
        <p className="text-label text-primary">Marketplace</p>
        <h1 className="text-h2 mt-1 max-w-2xl font-bold tracking-tight">
          Learn from India&rsquo;s top creators
        </h1>
        <p className="text-body mt-2 max-w-xl text-muted-foreground">
          Book 1:1 sessions, join live workshops, and grab digital resources — across every niche.
        </p>

        {/* Quick niche entry */}
        <div className="mt-6 flex flex-wrap gap-2">
          {FEATURED.map((n) => (
            <Link
              key={n.value}
              href={`/explore?niche=${n.value}`}
              className="group flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-[13px] font-medium text-foreground/80 shadow-sm transition-all hover:border-primary/40 hover:text-foreground"
            >
              <FontAwesomeIcon icon={n.icon} className="size-3 text-muted-foreground/70 transition-colors group-hover:text-primary" />
              {n.label}
            </Link>
          ))}
          <Link
            href="/explore?sort=top_rated"
            className="group flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Browse all
            <FontAwesomeIcon icon={faArrowRight} className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
