import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

interface ExplorePagerProps {
  page: number
  totalPages: number
  /** Current query params (q/type/niche/sort) preserved across page links; `page` is overwritten. */
  params: Record<string, string | undefined>
}

function hrefFor(params: ExplorePagerProps['params'], page: number): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (k !== 'page' && v) sp.set(k, v)
  }
  if (page > 1) sp.set('page', String(page))
  const qs = sp.toString()
  return qs ? `/explore?${qs}` : '/explore'
}

/** Pure-RSC pagination (URL-driven, crawlable). Renders nothing for a single page. */
export function ExplorePager({ page, totalPages, params }: ExplorePagerProps) {
  if (totalPages <= 1) return null

  // Compact window of page numbers around the current page.
  const windowSize = 5
  let start = Math.max(1, page - Math.floor(windowSize / 2))
  const end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <PagerLink href={hrefFor(params, page - 1)} disabled={page <= 1} aria-label="Previous page">
        <FontAwesomeIcon icon={faChevronLeft} className="size-3" />
      </PagerLink>

      {pages.map((p) => (
        <PagerLink key={p} href={hrefFor(params, p)} active={p === page} aria-label={`Page ${p}`}>
          {p}
        </PagerLink>
      ))}

      <PagerLink href={hrefFor(params, page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <FontAwesomeIcon icon={faChevronRight} className="size-3" />
      </PagerLink>
    </nav>
  )
}

function PagerLink({
  href, children, active, disabled, ...rest
}: {
  href: string; children: React.ReactNode; active?: boolean; disabled?: boolean
} & React.AriaAttributes) {
  const cls = cn(
    'flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-[13px] font-medium transition-colors',
    active
      ? 'border-foreground bg-foreground text-background'
      : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground',
    disabled && 'pointer-events-none opacity-40',
  )
  if (disabled) {
    return <span className={cls} aria-disabled {...rest}>{children}</span>
  }
  return <Link href={href} className={cls} {...rest}>{children}</Link>
}
