import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { MetricCard } from '@/components/dashboard/creator/metric-card'
import { EarningsChart } from '@/components/dashboard/creator/earnings-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  faEye,
  faChartLine,
  faStar,
  faRotate,
} from '@fortawesome/free-solid-svg-icons'
import { analyticsSummary, topOffers } from '@/data/mock-creator-tools'
import { creatorMetrics } from '@/data/mock-earnings'
import { formatCurrency } from '@/lib/utils'

export const metadata = { title: 'Analytics — Creonex' }

export default function AnalyticsPage(): React.ReactElement {
  return (
    <>
      <DashboardTopbar title="Analytics" />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Profile views"
            value={analyticsSummary.totalViews.toLocaleString()}
            change={analyticsSummary.viewsChange}
            changeLabel="this month"
            icon={faEye}
            index={0}
          />
          <MetricCard
            label="Conversion rate"
            value={`${analyticsSummary.conversionRate}%`}
            change={analyticsSummary.conversionChange}
            changeLabel="this month"
            icon={faChartLine}
            index={1}
          />
          <MetricCard
            label="Avg rating"
            value={analyticsSummary.avgRating.toString()}
            changeLabel="across all reviews"
            icon={faStar}
            index={2}
          />
          <MetricCard
            label="Repeat rate"
            value={`${analyticsSummary.repeatRate}%`}
            changeLabel="rebooking"
            icon={faRotate}
            index={3}
          />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <EarningsChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Top performing offers</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {topOffers.map((o, i) => (
              <div key={o.title} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="w-5 shrink-0 text-sm font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{o.title}</p>
                  <p className="text-xs text-muted-foreground">{o.bookings} bookings</p>
                </div>
                <span className="shrink-0 text-sm font-medium">{formatCurrency(o.revenue)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MetricCard label="Earned this month" value={formatCurrency(creatorMetrics.earningsThisMonth)} index={0} />
          <MetricCard label="Total bookings" value={creatorMetrics.totalBookings.toString()} index={1} />
          <MetricCard label="All-time earned" value={formatCurrency(creatorMetrics.totalEarned)} index={2} />
        </div>
      </div>
    </>
  )
}
