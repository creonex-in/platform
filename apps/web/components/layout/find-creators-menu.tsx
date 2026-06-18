'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone, faUsers, faFileArrowDown, faChevronDown, faArrowRight,
} from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'
import { NICHE_OPTIONS } from '@/constants/onboarding'

const OFFER_TYPES = [
  {
    value: '1on1',
    label: '1:1 Sessions',
    description: 'Personal coaching & mentoring',
    icon: faPhone,
    color: 'text-[var(--pastel-sky)]',
    bg: 'bg-sky-500/10 dark:bg-sky-400/10',
  },
  {
    value: 'live',
    label: 'Live Workshops',
    description: 'Group sessions & webinars',
    icon: faUsers,
    color: 'text-[var(--pastel-lavender)]',
    bg: 'bg-violet-500/10 dark:bg-violet-400/10',
  },
  {
    value: 'digital',
    label: 'Digital Products',
    description: 'PDFs, templates & resources',
    icon: faFileArrowDown,
    color: 'text-[var(--pastel-sage)]',
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
  },
]

const FEATURED_VALUES = [
  'coding_dsa', 'design_creative', 'ai_data_science', 'personal_finance',
  'digital_marketing', 'startup_product', 'fitness_nutrition', 'writing_content',
]
const FEATURED_NICHES = NICHE_OPTIONS.filter((n) => FEATURED_VALUES.includes(n.value))

export function FindCreatorsMenu(): React.ReactElement {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function show(): void {
    clearTimeout(timer.current)
    setOpen(true)
  }
  function hide(): void {
    timer.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <div className="relative hidden md:block" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        className={cn(
          'flex items-center gap-1.5 whitespace-nowrap text-[12px] font-semibold uppercase tracking-wide transition-colors',
          open ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Find Creators
        <FontAwesomeIcon
          icon={faChevronDown}
          className={cn('size-[9px] transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="animate-in fade-in-0 zoom-in-95 absolute left-0 top-full z-50 mt-2 w-[520px] overflow-hidden rounded-2xl border border-border bg-popover shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18)] duration-100"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {/* Offer types */}
          <div className="border-b border-border px-5 py-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Browse by type
            </p>
            <div className="grid grid-cols-3 gap-2">
              {OFFER_TYPES.map((t) => (
                <Link
                  key={t.value}
                  href={`/explore?type=${t.value}`}
                  onClick={() => setOpen(false)}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3.5 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <span className={cn('flex size-8 items-center justify-center rounded-lg', t.bg)}>
                    <FontAwesomeIcon icon={t.icon} className={cn('size-3.5', t.color)} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{t.label}</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{t.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Niche grid */}
          <div className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Browse by topic
              </p>
              <Link
                href="/explore"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                View all
                <FontAwesomeIcon icon={faArrowRight} className="size-2.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {FEATURED_NICHES.map((n) => (
                <Link
                  key={n.value}
                  href={`/explore?niche=${n.value}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  <FontAwesomeIcon icon={n.icon} className="size-3.5 shrink-0 text-muted-foreground" />
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
