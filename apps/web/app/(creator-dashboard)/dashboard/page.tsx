import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shared/dashboard-shell'
import { ProfileLinkButton } from '@/components/dashboard/creator/profile-link-button'
import { WelcomeDialog } from './_components/welcome-dialog'
import { DashboardHero } from './_components/dashboard-hero'
import { TodaySessionStrip } from './_components/today-session-strip'
import { EarningsSummaryCard } from './_components/earnings-summary-card'
import { NewBookingAlert } from './_components/new-booking-alert'
import { QuickStatsRow } from './_components/quick-stats-row'
import { ActivityFeed } from './_components/activity-feed'
import { ChartsRow } from './_components/charts-row'
import { AboveFoldSkeleton, BelowFoldSkeleton } from './_components/skeletons'
import { getCreatorContext } from '@/dal/users.dal'

export const metadata = { title: 'Dashboard — Creonex' }

/** Topbar action — needs the profile username, so it streams in on its own
 *  (fallback null) and never blocks the instant topbar. */
async function ProfileLinkAction(): Promise<React.ReactElement | null> {
  const { profile } = await getCreatorContext()
  return profile?.username ? <ProfileLinkButton username={profile.username} /> : null
}

/** First-run welcome dialog, gated on ?welcome=1&offer=… */
async function WelcomeDialogSlot({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; offer?: string }>
}): Promise<React.ReactElement | null> {
  const [{ profile }, params] = await Promise.all([getCreatorContext(), searchParams])
  if (params.welcome !== '1' || !params.offer) return null
  return <WelcomeDialog offerId={params.offer} username={profile?.username ?? undefined} />
}

/** Above-the-fold group — hero, new-booking alert, today's sessions, quick stats. */
function AboveFold(): React.ReactElement {
  return (
    <div className="space-y-6">
      <DashboardHero />
      <NewBookingAlert />
      <TodaySessionStrip />
      <QuickStatsRow />
    </div>
  )
}

/** Below-the-fold group — charts, earnings summary, activity feed. */
function BelowFold(): React.ReactElement {
  return (
    <div className="space-y-6">
      <ChartsRow />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <EarningsSummaryCard />
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}

export default function CreatorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; offer?: string }>
}): React.ReactElement {
  return (
    <DashboardShell
      title="Dashboard"
      action={
        <Suspense fallback={null}>
          <ProfileLinkAction />
        </Suspense>
      }
    >
      <Suspense fallback={null}>
        <WelcomeDialogSlot searchParams={searchParams} />
      </Suspense>

      {/* Above the fold — one coherent frame */}
      <Suspense fallback={<AboveFoldSkeleton />}>
        <AboveFold />
      </Suspense>

      {/* Below the fold — second frame */}
      <Suspense fallback={<BelowFoldSkeleton />}>
        <BelowFold />
      </Suspense>
    </DashboardShell>
  )
}
