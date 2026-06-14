'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

export interface StatItem {
  label: string
  value: string
  /** Signed % delta — rendered green/red with a trend arrow. */
  change?: number
  /** Muted note next to (or instead of) the delta, e.g. "this month". */
  changeLabel?: string
  icon?: IconDefinition
}

/**
 * One framed panel with metrics split by hairline dividers (the gap-px + bg-border
 * trick draws clean 1px lines between every cell, responsive with no per-cell logic).
 * Shared by the creator dashboard and the offers page for a consistent, dense look.
 */
export function StatPanel({ stats }: { stats: StatItem[] }): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {stats.map((s) => {
          const positive = (s.change ?? 0) >= 0
          return (
            <div key={s.label} className="bg-card p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                {s.icon && <FontAwesomeIcon icon={s.icon} className="size-3.5 text-muted-foreground/50" />}
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-[28px]">
                {s.value}
              </p>
              {(s.change !== undefined || s.changeLabel) && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                  {s.change !== undefined && (
                    <span
                      className={cn(
                        'flex items-center gap-1 font-semibold',
                        positive ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive',
                      )}
                    >
                      <FontAwesomeIcon icon={positive ? faArrowTrendUp : faArrowTrendDown} className="size-3" />
                      {positive ? '+' : ''}{s.change}%
                    </span>
                  )}
                  {s.changeLabel && <span className="text-muted-foreground">{s.changeLabel}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
