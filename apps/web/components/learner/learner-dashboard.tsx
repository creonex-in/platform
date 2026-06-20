import { requireLearner } from '@/lib/auth-guards'
import {
  getLearnerBookings,
  getLearnerOverview,
  getLearnerProfile,
  getPublicOfferings,
} from '@/dal/learner.dal'
import { HomeRail } from '@/components/learner/home-rail'
import { FeaturedSessionCard } from '@/components/learner/featured-session-card'
import { OfferingsCarousel } from '@/components/learner/offerings-carousel'
import { isUpcoming } from '@/components/learner/shared'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faNoteSticky, faUsers, faUserCheck, faShieldHalved,
  faCalendarDay,
} from '@fortawesome/free-solid-svg-icons'
import type { LearnerBookingItem } from '@creonex/types'


function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export async function LearnerDashboard(): Promise<React.ReactElement> {
  // 1. Fetch user auth, bookings, overview, and profile in parallel
  const [user, bookings, overview, _profile] = await Promise.all([
    requireLearner(),
    getLearnerBookings(),
    getLearnerOverview(),
    getLearnerProfile(),
  ]);

  const firstName = (user.name ?? user.email).split(' ')[0]

  // 2. Filter bookings for upcoming, digital, and past
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

  // Find next session for countdown card (soonest upcoming)
  const nextSession = upcoming.sort(
    (a, b) =>
      new Date(a.startTime ?? 0).getTime() - new Date(b.startTime ?? 0).getTime(),
  )[0] ?? null

  // 3. Query catalog offerings in parallel (CAT/MBA, UPSC, Coding/DSA, Workshops)
  const [catPrepRes, upscExamsRes, codingDsaRes, workshopsRes] = await Promise.all([
    getPublicOfferings({ niche: 'cat_mba_prep', limit: 8 }),
    getPublicOfferings({ niche: 'upsc_govt_exams', limit: 8 }),
    getPublicOfferings({ niche: 'coding_dsa', limit: 8 }),
    getPublicOfferings({ type: 'live_event', limit: 8 }),
  ])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      {/* Header Greeting & Welcome Strip */}
      <div className="space-y-4">
        <div>
          <p className="text-base font-medium text-muted-foreground">
            {greeting()}, {firstName}
          </p>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl mt-1">
            My Learning
          </h1>
        </div>

        {/* Compact Trust Ribbon (Udemy credibility style) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 rounded-2xl border border-border bg-card/65 backdrop-blur-md p-5 text-xs font-semibold text-muted-foreground shadow-sm">
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-foreground text-background border border-foreground/10">
              <FontAwesomeIcon icon={faUsers} className="size-4.5" />
            </div>
            <div>
              <p className="text-foreground font-bold text-[13px]">12,450+ Active</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Trusted Learners</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-foreground text-background border border-foreground/10">
              <FontAwesomeIcon icon={faUserCheck} className="size-4.5" />
            </div>
            <div>
              <p className="text-foreground font-bold text-[13px]">850+ Experts</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Verified Creators</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-foreground text-background border border-foreground/10">
              <FontAwesomeIcon icon={faCalendarDay} className="size-4.5" />
            </div>
            <div>
              <p className="text-foreground font-bold text-[13px]">45,000+ Booked</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">1:1 & Group Calls</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/15">
              <FontAwesomeIcon icon={faShieldHalved} className="size-4.5" />
            </div>
            <div>
              <p className="text-foreground font-bold text-[13px]">100% Secure</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Razorpay Checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* "Your next session" Hero Card (Highest utility at top) */}
      {nextSession && <FeaturedSessionCard booking={nextSession} />}

      {/* Catalog Section 1: CAT / MBA Prep */}
      {catPrepRes.items.length > 0 && (
        <OfferingsCarousel
          title="Top 1:1 Sessions in CAT & MBA Prep"
          subtitle="Handpicked sessions with premium business mentors and educators"
          items={catPrepRes.items}
        />
      )}

      {/* Catalog Section 2: UPSC & Govt Exams */}
      {upscExamsRes.items.length > 0 && (
        <OfferingsCarousel
          title="UPSC & Civil Services Coaching"
          subtitle="Direct guidance, essay reviews, and mains answers strategy"
          items={upscExamsRes.items}
        />
      )}

      {/* Catalog Section 3: Live Workshops & bootcamps */}
      {workshopsRes.items.length > 0 && (
        <OfferingsCarousel
          title="Upcoming Live Group Workshops"
          subtitle="Interactive bootcamp and presentation slots with real-time feedback"
          items={workshopsRes.items}
        />
      )}

      {/* Catalog Section 4: Coding & DSA */}
      {codingDsaRes.items.length > 0 && (
        <OfferingsCarousel
          title="Coding & System Design Sessions"
          subtitle="Mock coding interviews, DSA practice, and portfolio design checks"
          items={codingDsaRes.items}
        />
      )}



      {/* Main layout grid containing 1:1 sessions, digital vault, and library helpers */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left column (2/3 width on desktop) */}
        <div className="lg:col-span-8">
          <HomeRail upcoming={upcoming} digital={digital} past={past} />
        </div>

        {/* Right column (1/3 width on desktop) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick stats inline pills */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-xs font-semibold text-muted-foreground w-fit shadow-sm">
            <span className="text-foreground font-bold">{upcoming.length}</span> upcoming
            <span>·</span>
            <span className="text-foreground font-bold">{digital.length}</span> digital
            <span>·</span>
            <span className="text-foreground font-bold">{overview.savedCount}</span> saved
          </div>

          {/* Notes CTA card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <FontAwesomeIcon icon={faNoteSticky} className="text-primary size-4" />
                Notes & Takeaways
              </h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Keep track of key learnings, goals, and feedback from your mentoring sessions.
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              className="h-10 rounded-xl w-full text-xs font-semibold"
              nativeButton={false}
              render={<Link href="/learner/library" />}
            >
              Go to notes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

