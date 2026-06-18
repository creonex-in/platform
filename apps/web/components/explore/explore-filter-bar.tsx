'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faCalendar, faBoxOpen, faChevronDown, faArrowDownWideShort } from '@fortawesome/free-solid-svg-icons'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { NICHE_OPTIONS } from '@/constants/onboarding'
import { nicheLabel } from '@/lib/niche'
import { cn } from '@/lib/utils'

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: '1on1', label: '1:1 Sessions', icon: faBolt },
  { value: 'live', label: 'Live Workshops', icon: faCalendar },
  { value: 'digital', label: 'Digital', icon: faBoxOpen },
] as const

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'top_rated', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
] as const

interface ExploreFilterBarProps {
  activeType: string
  activeNiche: string
  activeSort: string
}

export function ExploreFilterBar({ activeType, activeNiche, activeSort }: ExploreFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function pushParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === 'relevance') params.delete(key)
    else params.set(key, value)
    params.delete('page') // any filter change resets to page 1
    router.push(`/explore?${params.toString()}`)
  }

  const sortLabel = SORT_OPTIONS.find((s) => s.value === activeSort)?.label ?? 'Relevance'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Type pills */}
      {TYPE_FILTERS.map((f) => {
        const active = activeType === f.value
        return (
          <button
            key={f.value}
            onClick={() => pushParam('type', f.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-all duration-150',
              active
                ? 'border-foreground bg-foreground text-background shadow-sm'
                : 'border-border bg-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground',
            )}
          >
            {'icon' in f && (
              <FontAwesomeIcon icon={f.icon} className={cn('size-3', active ? 'text-background' : 'text-muted-foreground/60')} />
            )}
            {f.label}
          </button>
        )
      })}

      <div className="mx-0.5 hidden h-4 w-px bg-border sm:block" />

      {/* Niche dropdown (replaces native select) */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium outline-none transition-colors',
            activeNiche !== 'all'
              ? 'border-foreground/30 text-foreground'
              : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground',
          )}
        >
          {activeNiche === 'all' ? 'All niches' : nicheLabel(activeNiche)}
          <FontAwesomeIcon icon={faChevronDown} className="size-2.5 text-muted-foreground/60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
          <DropdownMenuItem onClick={() => pushParam('niche', 'all')}>All niches</DropdownMenuItem>
          {NICHE_OPTIONS.map((n) => (
            <DropdownMenuItem key={n.value} onClick={() => pushParam('niche', n.value)}>
              <FontAwesomeIcon icon={n.icon} className="text-muted-foreground" />
              {n.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:border-foreground/20 hover:text-foreground">
          <FontAwesomeIcon icon={faArrowDownWideShort} className="size-3 text-muted-foreground/60" />
          {sortLabel}
          <FontAwesomeIcon icon={faChevronDown} className="size-2.5 text-muted-foreground/60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {SORT_OPTIONS.map((s) => (
            <DropdownMenuItem key={s.value} onClick={() => pushParam('sort', s.value)}>
              {s.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
