import { getLearnerBookings, getLearnerNotes } from '@/dal/learner.dal'
import { PageShell, SectionHeading } from '@/components/learner/shared'
import { LibraryTabs } from '@/components/learner/library-tabs'

export const metadata = { title: 'Library — Creonex' }

export default async function LearnerLibraryPage(): Promise<React.ReactElement> {
  const [bookings, notes] = await Promise.all([
    getLearnerBookings(),
    getLearnerNotes(),
  ])
  const digital = bookings.filter((b) => b.offeringType === 'digital')

  return (
    <PageShell>
      <SectionHeading title="Your library" subtitle="Your purchases and personal notes." />
      <LibraryTabs digital={digital} notes={notes} />
    </PageShell>
  )
}
