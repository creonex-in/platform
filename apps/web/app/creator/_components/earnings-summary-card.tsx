import { getCreatorDashboardSummary } from '@/dal/dashboard.dal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIndianRupeeSign, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

function EarningsRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-xs text-muted-foreground' : 'text-sm text-muted-foreground'}>{label}</span>
      <span className={muted ? 'text-sm text-muted-foreground' : 'text-sm font-semibold tabular-nums'}>{value}</span>
    </div>
  )
}

export async function EarningsSummaryCard() {
  const data = await getCreatorDashboardSummary()
  if (!data) return null

  const { earnings } = data
  const thisWeek = formatCurrency(Math.round(earnings.thisWeekPaise / 100))
  const thisMonth = formatCurrency(Math.round(earnings.thisMonthPaise / 100))
  const pending = formatCurrency(Math.round(earnings.pendingPaise / 100))

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FontAwesomeIcon icon={faIndianRupeeSign} className="size-4 text-emerald-500" />
          Earnings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <EarningsRow label="This week" value={thisWeek} />
          <EarningsRow label="This month" value={thisMonth} />
          <div className="border-t pt-2">
            <EarningsRow label="Pending payout" value={pending} muted />
          </div>
        </div>
        <Link
          href="/creator/payouts"
          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full' })}
        >
          Request payout
          <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 size-3" />
        </Link>
      </CardContent>
    </Card>
  )
}
