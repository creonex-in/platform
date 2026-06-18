import { requireLearner } from '@/lib/auth-guards'
import { getLearnerBookings, getLearnerOverview } from '@/dal/learner.dal'
import { LearningTimeline } from '@/components/learner/learning-timeline'
import { HomeRail } from '@/components/learner/home-rail'
import { StatsStrip } from '@/components/learner/stats-strip'
import { NextSessionBanner } from '@/components/learner/next-session-banner'
import { isUpcoming } from '@/components/learner/shared'
import type { LearnerBookingItem } from '@creonex/types'

export const metadata = { title: 'My Learning — Creonex' }

function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default async function LearnerHomePage(): Promise<React.ReactElement> {
  const [user, bookings, overview] = await Promise.all([
    requireLearner(),
    getLearnerBookings(),
    getLearnerOverview(),
  ])
  const firstName = (user.name ?? user.email).split(' ')[0]

  const upcoming = bookings.filter(
    (b: LearnerBookingItem) =>
      b.offeringType !== 'digital' &&
      b.status === 'confirmed' &&
      isUpcoming(b.startTime),
  )
  const digital = bookings.filter(
    (b: LearnerBookingItem) =>
      b.offeringType === 'digital' &&
      (b.status === 'confirmed' || b.status === 'completed'),
  )
  const past = bookings.filter(
    (b: LearnerBookingItem) => b.offeringType !== 'digital' && !upcoming.includes(b),
  )
  const completed = bookings.filter(
    (b: LearnerBookingItem) =>
      b.offeringType !== 'digital' && b.status === 'completed',
  )

  // Next session for countdown banner (soonest upcoming)
  const nextSession = upcoming.sort(
    (a, b) =>
      new Date(a.startTime ?? 0).getTime() - new Date(b.startTime ?? 0).getTime(),
  )[0] ?? null

  // Timeline = upcoming first (soonest), then most-recent other activity
  const timeline = [
    ...upcoming,
    ...bookings
      .filter((b: LearnerBookingItem) => !upcoming.includes(b))
      .slice(0, 6),
  ].slice(0, 7)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Heading */}
      <div className="mb-6">
        <p className="text-[15px] text-muted-foreground">{greeting()}, {firstName}</p>
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
          Learning Timeline
        </h1>
      </div>

      {/* Stats strip */}
      <StatsStrip
        upcomingCount={upcoming.length}
        completedCount={completed.length}
        digitalCount={digital.length}
        savedCount={overview.savedCount}
      />

      {/* Countdown banner — only renders client-side when session is within 24h */}
      <NextSessionBanner session={nextSession} />

      {/* Main + rail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <LearningTimeline items={timeline} />
        </div>
        <div className="lg:col-span-4">
          <HomeRail upcoming={upcoming} digital={digital} past={past} />
        </div>
      </div>
    </div>
  )
}
