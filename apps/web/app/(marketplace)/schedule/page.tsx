import { getLearnerBookings } from '@/dal/learner.dal'
import { PageShell, SectionHeading } from '@/components/learner/shared'
import { ScheduleList } from '@/components/learner/schedule-list'

export const metadata = { title: 'Schedule — Creonex' }

export default async function LearnerSchedulePage(): Promise<React.ReactElement> {
  const bookings = await getLearnerBookings()
  return (
    <PageShell>
      <SectionHeading title="Your schedule" subtitle="Upcoming and past sessions & workshops." />
      <ScheduleList bookings={bookings} />
    </PageShell>
  )
}
