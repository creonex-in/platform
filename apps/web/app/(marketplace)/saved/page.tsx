import { getLearnerSaved } from '@/dal/learner.dal'
import { PageShell, SectionHeading } from '@/components/learner/shared'
import { SavedList } from '@/components/learner/saved-list'

export const metadata = { title: 'Saved — Creonex' }

export default async function LearnerSavedPage(): Promise<React.ReactElement> {
  const saved = await getLearnerSaved()
  return (
    <PageShell>
      <SectionHeading title="Saved" subtitle="Creators and offerings you bookmarked." />
      <SavedList initial={saved} />
    </PageShell>
  )
}
