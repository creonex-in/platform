import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faCheck, faVault, faBookmark } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

interface Stat {
  icon: typeof faCalendarDays
  label: string
  value: number
  accent: string
}

export function StatsStrip({
  upcomingCount,
  completedCount,
  digitalCount,
  savedCount,
}: {
  upcomingCount: number
  completedCount: number
  digitalCount: number
  savedCount: number
}): React.ReactElement {
  const stats: Stat[] = [
    { icon: faCalendarDays, label: 'Upcoming', value: upcomingCount, accent: 'text-[var(--pastel-sky)]' },
    { icon: faCheck, label: 'Attended', value: completedCount, accent: 'text-emerald-500' },
    { icon: faVault, label: 'Digital', value: digitalCount, accent: 'text-[var(--pastel-sage)]' },
    { icon: faBookmark, label: 'Saved', value: savedCount, accent: 'text-[var(--pastel-lavender)]' },
  ]

  return (
    <div className="mb-6 grid grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center rounded-2xl border border-border bg-card px-2 py-4 text-center">
          <FontAwesomeIcon icon={s.icon} className={cn('mb-1.5 size-4', s.accent)} />
          <span className="text-xl font-bold tabular-nums text-foreground">{s.value}</span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  )
}
