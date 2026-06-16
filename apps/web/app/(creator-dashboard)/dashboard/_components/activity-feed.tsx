import { getCreatorDashboardSummary } from '@/dal/dashboard.dal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoneyBill, faStar, faCalendarCheck, faBoltLightning } from '@fortawesome/free-solid-svg-icons'
import type { ActivityFeedItem } from '@creonex/types'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs === 1 ? '1h ago' : `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

type FeedType = 'payout' | 'review' | 'booking'

function FeedIcon({ type }: { type: FeedType }) {
  const map: Record<FeedType, { icon: typeof faMoneyBill; cls: string }> = {
    payout: { icon: faMoneyBill, cls: 'bg-emerald-500/10 text-emerald-600' },
    review: { icon: faStar, cls: 'bg-amber-500/10 text-amber-600' },
    booking: { icon: faCalendarCheck, cls: 'bg-primary/10 text-primary' },
  }
  const { icon, cls } = map[type]
  return (
    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${cls}`}>
      <FontAwesomeIcon icon={icon} className="size-3.5" />
    </div>
  )
}

export async function ActivityFeed() {
  const data = await getCreatorDashboardSummary()
  if (!data || data.activityFeed.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 py-5 text-muted-foreground">
          <FontAwesomeIcon icon={faBoltLightning} className="size-4 shrink-0" />
          <p className="text-sm">Activity will appear here once you start getting bookings.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FontAwesomeIcon icon={faBoltLightning} className="size-4 text-primary" />
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {data.activityFeed.map((item: ActivityFeedItem) => (
            <li key={item.id} className="flex items-start gap-3">
              <FeedIcon type={item.type as FeedType} />
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{item.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(item.occurredAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
