import type { Metadata } from 'next'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo, faCalendarDays, faBookOpen, faCompass } from '@fortawesome/free-solid-svg-icons'
import { getLearnerDashboard } from '@/dal/learner.dal'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { ContinueLearning } from '@/components/dashboard/learner/continue-learning'
import { UpcomingAgenda } from '@/components/dashboard/learner/upcoming-agenda'
import { SectionHeader } from '@/components/dashboard/shared/section-header'
import { WelcomeHero } from '@/components/dashboard/shared/welcome-hero'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Home — Creonex',
  description: 'Your upcoming sessions, workshops, and courses in one place.',
}

export default async function LearnerHomePage(): Promise<React.ReactElement> {
  const { learner, upcomingSessions, upcomingWorkshops, courses } = await getLearnerDashboard()

  return (
    <>
      <DashboardTopbar title="Home" showSearch />

      <div className="space-y-12 p-4 sm:p-6 lg:p-8">
        <WelcomeHero
          name={learner.name}
          initials={learner.initials}
          subtitle="Here's everything you've signed up for. Pick up where you left off, and don't miss what's coming up."
          stats={[
            { label: 'Upcoming sessions', value: upcomingSessions.length.toString() },
            { label: 'Upcoming workshops', value: upcomingWorkshops.length.toString() },
            { label: 'Courses in progress', value: courses.length.toString() },
          ]}
          action={
            <Link href="/learner/search" className={cn(buttonVariants({ size: 'sm' }))}>
              <FontAwesomeIcon icon={faCompass} className="mr-1.5 size-3.5" />
              Browse mentors
            </Link>
          }
        />

        {/* 1 — Upcoming 1:1 sessions */}
        <section className="space-y-5">
          <SectionHeader
            icon={faVideo}
            title="Your 1:1 Sessions"
            description="Personal mentorship calls you've booked. Be ready to join on time."
            viewAllHref="/learner/sessions"
          />
          <UpcomingAgenda items={upcomingSessions} />
        </section>

        {/* 2 — Upcoming workshops */}
        <section className="space-y-5">
          <SectionHeader
            icon={faCalendarDays}
            title="Your Workshops"
            description="Live group sessions you've registered for. Save the date."
            viewAllHref="/learner/workshops"
          />
          <UpcomingAgenda items={upcomingWorkshops} />
        </section>

        {/* 3 — Continue courses */}
        <section className="space-y-5">
          <SectionHeader
            icon={faBookOpen}
            title="Continue Your Courses"
            description="Self-paced courses you're enrolled in. Resume where you left off."
            viewAllHref="/learner/courses"
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {courses.map((c) => (
              <ContinueLearning key={c.id} course={c} />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
