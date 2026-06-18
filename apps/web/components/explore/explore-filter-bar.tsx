'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faCalendar, faBoxOpen, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

const TYPE_FILTERS = [
  { value: 'all',     label: 'All' },
  { value: '1on1',   label: '1:1 Sessions',   icon: faBolt },
  { value: 'live',   label: 'Live Workshops', icon: faCalendar },
  { value: 'digital',label: 'Digital Assets', icon: faBoxOpen },
] as const

const TOP_NICHES = [
  { value: 'all',               label: 'All Niches' },
  { value: 'design_creative',   label: 'UI/UX Design' },
  { value: 'coding_dsa',        label: 'Coding & DSA' },
  { value: 'ai_data_science',   label: 'Data Science' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'personal_finance',  label: 'Personal Finance' },
  { value: 'startup_product',   label: 'Startup & Product' },
  { value: 'fitness_nutrition', label: 'Fitness & Yoga' },
  { value: 'writing_content',   label: 'Content Writing' },
]

interface ExploreFilterBarProps {
  activeType: string
  activeNiche: string
}

export function ExploreFilterBar({ activeType, activeNiche }: ExploreFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function pushParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    value === 'all' ? params.delete(key) : params.set(key, value)
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Type filters */}
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

      {/* Separator */}
      <div className="mx-0.5 hidden h-4 w-px bg-border sm:block" />

      {/* Niche select */}
      <div className="relative">
        <select
          value={activeNiche}
          onChange={(e) => pushParam('niche', e.target.value)}
          className={cn(
            'cursor-pointer appearance-none rounded-full border border-border bg-transparent',
            'py-1.5 pl-4 pr-8 text-[13px] font-medium text-muted-foreground',
            'transition-colors hover:border-foreground/20 hover:text-foreground focus:outline-none',
          )}
        >
          {TOP_NICHES.map((n) => (
            <option key={n.value} value={n.value}>{n.label}</option>
          ))}
        </select>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="pointer-events-none absolute right-3 top-1/2 size-2.5 -translate-y-1/2 text-muted-foreground/60"
        />
      </div>
    </div>
  )
}
