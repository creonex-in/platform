import { getCreatorDashboardSummary } from '@/dal/dashboard.dal'
import { buttonVariants } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { formatCurrency, cn } from '@/lib/utils'
import Link from 'next/link'

export async function NewBookingAlert() {
  const data = await getCreatorDashboardSummary()
  if (!data || data.newBookings.length === 0) return null

  const [first, ...rest] = data.newBookings
  const typeLabel =
    first.offeringType === 'one_on_one' ? '1:1' :
    first.offeringType === 'live_event' ? 'live event' : 'digital'
  const dateStr = first.startTime
    ? new Date(first.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null
  const amount = formatCurrency(Math.round(first.amountPaise / 100))

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
        <FontAwesomeIcon icon={faCalendarCheck} className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          New booking{rest.length > 0 ? `s (${data.newBookings.length})` : ''}!
        </p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{first.learnerName}</span>
          {' '}booked a {typeLabel} session{dateStr ? ` for ${dateStr}` : ''} ·{' '}
          <span className="font-semibold text-foreground">{amount}</span> confirmed
          {rest.length > 0 ? ` · +${rest.length} more` : ''}
        </p>
      </div>
      <Link
        href="/bookings"
        className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}
      >
        View
        <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 size-3" />
      </Link>
    </div>
  )
}
