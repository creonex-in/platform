import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Category {
  label: string
  slug: string
}

interface Props {
  categories: Category[]
}

export default function ExploreCategories({ categories }: Props): React.ReactElement {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-background px-4 py-20 sm:py-24">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-[500px] rounded-full bg-primary/4 blur-[130px]" />
      <div className="pointer-events-none absolute right-10 top-10 h-72 w-72 rounded-full bg-accent/5 blur-[100px]" />

      <div className="relative mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">

          {/* Left column */}
          <div className="space-y-4 lg:col-span-4 lg:sticky lg:top-8">
            <h2 className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Explore Other Domains
            </h2>
            <p className="text-balance leading-relaxed text-muted-foreground/90">
              The network spans beyond this niche. Discover verified practitioners, creators, and world-class mentors across adjacent disciplines.
            </p>
            <div className="pt-4">
              <Link
                href="/become-a-creator"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'default' }),
                  'group gap-2 rounded-full border-border/80 bg-card/50 text-xs font-semibold tracking-wide shadow-xs transition-all duration-300 hover:border-primary/40 hover:bg-background'
                )}
              >
                Browse All Creators
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="size-3 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            </div>
          </div>

          {/* Right column — category grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/top-creators/${cat.slug}`}
                  className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-xs transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-6 items-center justify-center rounded-md border border-border/80 bg-background text-[10px] font-bold text-muted-foreground">
                      #
                    </div>
                    <span className="font-display text-sm font-semibold tracking-tight text-foreground">
                      {cat.label}
                    </span>
                  </div>

                  <div className="flex size-6 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <FontAwesomeIcon icon={faArrowRight} className="size-2-5 -rotate-45 transition-transform duration-200 group-hover:rotate-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
