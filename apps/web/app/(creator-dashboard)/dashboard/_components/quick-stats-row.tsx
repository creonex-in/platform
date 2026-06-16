import { getCreatorDashboardSummary } from '@/dal/dashboard.dal'
import { StatPanel } from '@/components/dashboard/creator/stat-panel'
import { faVideo, faStar, faChartLine, faMedal } from '@fortawesome/free-solid-svg-icons'

function ordinal(n: number): string {
  if (n <= 0) return '—'
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export async function QuickStatsRow() {
  const data = await getCreatorDashboardSummary()
  if (!data) return null

  const { totalSessions, totalReviews, avgRating, nicheRank, nicheTotal } = data.quickStats

  return (
    <StatPanel
      stats={[
        {
          label: 'Total sessions',
          value: totalSessions.toLocaleString('en-IN'),
          icon: faVideo,
        },
        {
          label: 'Total reviews',
          value: totalReviews.toLocaleString('en-IN'),
          icon: faStar,
        },
        {
          label: 'Avg rating',
          value: avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : '—',
          icon: faChartLine,
        },
        {
          label: 'Niche rank',
          value: nicheRank > 0 ? ordinal(nicheRank) : '—',
          changeLabel: nicheRank > 0 ? `of ${nicheTotal} in niche` : 'not ranked yet',
          icon: faMedal,
        },
      ]}
    />
  )
}
