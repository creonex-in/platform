import { getLearnerBookings, getLearnerSaved, getLearnerNotes } from '@/dal/learner.dal'
import { PageShell, SectionHeading } from '@/components/learner/shared'
import { LibraryTabs } from '@/components/learner/library-tabs'

export const metadata = { title: 'Library — Creonex' }

export default async function LearnerLibraryPage(): Promise<React.ReactElement> {
  const [bookings, saved, notes] = await Promise.all([
    getLearnerBookings(),
    getLearnerSaved(),
    getLearnerNotes(),
  ])
  const digital = bookings.filter((b) => b.offeringType === 'digital')

  return (
    <PageShell>
      <SectionHeading title="Your library" subtitle="Purchases, saved items, and notes — all in one place." />
      <LibraryTabs digital={digital} saved={saved} notes={notes} />
    </PageShell>
  )
}
