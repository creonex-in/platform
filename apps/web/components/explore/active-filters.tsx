'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { nicheLabel } from '@/lib/niche'

const TYPE_LABEL: Record<string, string> = {
  '1on1': '1:1 Sessions',
  live: 'Live Workshops',
  digital: 'Digital',
}
const SORT_LABEL: Record<string, string> = {
  top_rated: 'Top rated',
  price_asc: 'Price ↑',
  price_desc: 'Price ↓',
  newest: 'Newest',
}

interface ActiveFiltersProps {
  q: string
  type: string
  niche: string
  sort: string
}

export function ActiveFilters({ q, type, niche, sort }: ActiveFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const chips: { key: string; label: string }[] = []
  if (q) chips.push({ key: 'q', label: `“${q}”` })
  if (type && type !== 'all') chips.push({ key: 'type', label: TYPE_LABEL[type] ?? type })
  if (niche && niche !== 'all') chips.push({ key: 'niche', label: nicheLabel(niche) })
  if (sort && sort !== 'relevance') chips.push({ key: 'sort', label: SORT_LABEL[sort] ?? sort })

  if (chips.length === 0) return null

  function remove(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `/explore?${qs}` : '/explore')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={() => remove(c.key)}
          className="group flex items-center gap-1.5 rounded-full border border-border bg-muted/50 py-1 pl-3 pr-2 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
        >
          {c.label}
          <span className="flex size-4 items-center justify-center rounded-full text-muted-foreground/60 transition-colors group-hover:bg-foreground/10 group-hover:text-foreground">
            <FontAwesomeIcon icon={faXmark} className="size-2.5" />
          </span>
        </button>
      ))}
      <button
        onClick={() => router.push('/explore')}
        className="text-[12px] font-semibold text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
      >
        Clear all
      </button>
    </div>
  )
}
