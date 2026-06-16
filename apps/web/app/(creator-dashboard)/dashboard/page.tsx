import { Suspense } from 'react'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { ProfileLinkButton } from '@/components/dashboard/creator/profile-link-button'
import { WelcomeDialog } from './_components/welcome-dialog'
import { DashboardHero } from './_components/dashboard-hero'
import { TodaySessionStrip } from './_components/today-session-strip'
import { EarningsSummaryCard } from './_components/earnings-summary-card'
import { NewBookingAlert } from './_components/new-booking-alert'
import { QuickStatsRow } from './_components/quick-stats-row'
import { ActivityFeed } from './_components/activity-feed'
import { ChartsRow } from './_components/charts-row'
import {
  HeroSkeleton,
  StatPanelSkeleton,
  ChartsRowSkeleton,
  TodayStripSkeleton,
  ActivityFeedSkeleton,
  CardSkeleton,
} from './_components/skeletons'
import { getCreatorContext } from '@/dal/users.dal'

export const metadata = { title: 'Dashboard — Creonex' }

export default async function CreatorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; offer?: string }>
}): Promise<React.ReactElement> {
  const [{ profile }, params] = await Promise.all([
    getCreatorContext(),
    searchParams,
  ])

  return (
    <>
      <DashboardTopbar
        title="Dashboard"
        action={profile?.username ? <ProfileLinkButton username={profile.username} /> : undefined}
      />
      {params.welcome === '1' && params.offer && (
        <WelcomeDialog offerId={params.offer} username={profile?.username ?? undefined} />
      )}

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Hero */}
        <Suspense fallback={<HeroSkeleton />}>
          <DashboardHero />
        </Suspense>

        {/* New booking banner — collapses cleanly when none */}
        <Suspense fallback={null}>
          <NewBookingAlert />
        </Suspense>

        {/* Today's sessions */}
        <Suspense fallback={<TodayStripSkeleton />}>
          <TodaySessionStrip />
        </Suspense>

        {/* Quick stats — hairline panel */}
        <Suspense fallback={<StatPanelSkeleton />}>
          <QuickStatsRow />
        </Suspense>

        {/* Charts — both always present, no gap */}
        <Suspense fallback={<ChartsRowSkeleton />}>
          <ChartsRow />
        </Suspense>

        {/* Earnings (1/3) + Activity feed (2/3) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Suspense fallback={<CardSkeleton bodyHeight="h-40" />}>
            <EarningsSummaryCard />
          </Suspense>
          <div className="lg:col-span-2">
            <Suspense fallback={<ActivityFeedSkeleton />}>
              <ActivityFeed />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
