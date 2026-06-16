import { getCreatorDashboardSummary } from '@/dal/dashboard.dal'
import { EarningsChartCard } from './earnings-chart-card'
import { BookingsChartCard } from './bookings-chart-card'

export async function ChartsRow() {
  const data = await getCreatorDashboardSummary()
  if (!data) return null

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <EarningsChartCard data={data.earningsTrend} />
      <BookingsChartCard data={data.bookingsTrend} />
    </div>
  )
}
