import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { MetricCard } from '@/components/dashboard/creator/metric-card'
import { EarningsChart } from '@/components/dashboard/creator/earnings-chart'
import { InsightBox } from '@/components/dashboard/creator/insight-box'
import { BookingRow } from '@/components/dashboard/creator/booking-row'
import { WelcomeHero } from '@/components/dashboard/shared/welcome-hero'
import { ProfileLinkButton } from '@/components/dashboard/creator/profile-link-button'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faShareNodes } from '@fortawesome/free-solid-svg-icons'
import { creatorMetrics } from '@/data/mock-earnings'
import { formatCurrency, cn, getInitials } from '@/lib/utils'
import { getCreatorContext } from '@/dal/users.dal'
import { getCreatorBookings } from '@/dal/bookings.dal'
import { getCreatorTestimonials } from '@/dal/testimonials.dal'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — Creonex' }

export default async function CreatorDashboardPage(): Promise<React.ReactElement> {
  const [{ user, profile }, allBookings, recentReviews] = await Promise.all([
    getCreatorContext(),
    getCreatorBookings(),
    getCreatorTestimonials(),
  ])
  const displayName = profile?.displayName ?? user?.name ?? 'Creator'
  const avatarImage = profile?.profilePhotoUrl ?? user?.image ?? null

  const upcomingBookings = allBookings.filter(
    (b) => b.status === 'pending_payment' || b.status === 'confirmed'
  )

  return (
    <>
      <DashboardTopbar
        title="Dashboard"
        action={profile?.username ? <ProfileLinkButton username={profile.username} /> : undefined}
      />
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <WelcomeHero
          name={displayName}
          initials={getInitials(displayName)}
          image={avatarImage}
          subtitle="Here's how your creator business is doing today."
          stats={[
            { label: 'This month', value: formatCurrency(creatorMetrics.earningsThisMonth) },
            { label: 'Bookings', value: creatorMetrics.totalBookings.toString() },
            { label: 'CQS score', value: creatorMetrics.cqsScore.toString() },
          ]}
          action={
            <>
              <Link href="/offers/new" className={cn(buttonVariants({ size: 'sm' }))}>
                <FontAwesomeIcon icon={faPlus} className="mr-1 size-4" />
                New offer
              </Link>
              {profile?.username && (
                <Link
                  href={`/c/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  <FontAwesomeIcon icon={faShareNodes} className="mr-1 size-3.5" />
                  Share page
                </Link>
              )}
            </>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Earnings (this month)"
            value={formatCurrency(creatorMetrics.earningsThisMonth)}
            change={creatorMetrics.earningsGrowth}
            changeLabel="vs last month"
            index={0}
          />
          <MetricCard
            label="Total bookings"
            value={creatorMetrics.totalBookings.toString()}
            changeLabel={`${creatorMetrics.bookingsThisWeek} this week`}
            index={1}
          />
          <MetricCard
            label="Profile views"
            value={creatorMetrics.profileViews.toLocaleString()}
            changeLabel={`${creatorMetrics.conversionRate}% conversion`}
            index={2}
          />
          <MetricCard
            label="CQS score"
            value={creatorMetrics.cqsScore.toString()}
            change={creatorMetrics.cqsChange}
            changeLabel="this month"
            index={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Weekly earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <EarningsChart />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{"Today's schedule"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {upcomingBookings.slice(0, 3).map((booking, i) => (
                <BookingRow key={booking.id} booking={booking} index={i} compact />
              ))}
            </CardContent>
          </Card>
        </div>

        <InsightBox
          message="Your profile conversion is 3.1% — below the 5% average. Adding 2 testimonials and updating your session title could boost bookings by ~40%."
          type="warning"
          actionLabel="Edit profile →"
        />

        {recentReviews.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recent reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="flex gap-3">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                    {getInitials(review.learnerName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{review.learnerName}</span>
                      <span className="text-xs text-amber-400">{'★'.repeat(review.rating)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{review.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
