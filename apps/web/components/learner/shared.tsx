import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo, faUsers, faFileArrowDown, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { cn } from '@/lib/utils'

// ── Offer-type metadata (learner vocabulary) ──────────────────────────────────
export const OFFER_TYPE_META: Record<string, { label: string; icon: IconDefinition; accent: string }> = {
  one_on_one: { label: '1:1 Session', icon: faVideo, accent: 'text-[var(--pastel-sky)]' },
  live_event: { label: 'Workshop', icon: faUsers, accent: 'text-[var(--pastel-lavender)]' },
  digital: { label: 'Digital', icon: faFileArrowDown, accent: 'text-[var(--pastel-sage)]' },
}

export function offerTypeMeta(type: string) {
  return OFFER_TYPE_META[type] ?? { label: type, icon: faFileArrowDown, accent: 'text-muted-foreground' }
}

export function liveEventLabel(format: string | null): string {
  return format === 'webinar' ? 'Webinar' : 'Group workshop'
}

// ── Booking status badge ──────────────────────────────────────────────────────
export const STATUS_META: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  pending_payment: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground line-through' },
  refunded: { label: 'Refunded', className: 'bg-muted text-muted-foreground' },
  no_show: { label: 'No-show', className: 'bg-destructive/10 text-destructive' },
}

export function StatusBadge({ status }: { status: string }): React.ReactElement {
  const m = STATUS_META[status] ?? { label: status, className: 'bg-muted text-muted-foreground' }
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', m.className)}>{m.label}</span>
  )
}

// ── Date/time formatting ──────────────────────────────────────────────────────
export function formatWhen(iso: string | null): string {
  if (!iso) return 'No date set'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  })
}

export function isUpcoming(iso: string | null): boolean {
  return !!iso && new Date(iso).getTime() >= Date.now()
}

// ── Layout helpers ────────────────────────────────────────────────────────────
export function SectionHeading({
  title, subtitle, action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}): React.ReactElement {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({
  icon, title, description, action,
}: {
  icon: IconDefinition
  title: string
  description?: string
  action?: React.ReactNode
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-3.5 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <FontAwesomeIcon icon={icon} className="size-6" />
      </div>
      <div className="space-y-1.5">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        {description && <p className="mx-auto max-w-sm text-[15px] text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageShell({ children }: { children: React.ReactNode }): React.ReactElement {
  return <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
}

export function Spinner(): React.ReactElement {
  return <FontAwesomeIcon icon={faCircleNotch} className="size-4 animate-spin text-muted-foreground" />
}
