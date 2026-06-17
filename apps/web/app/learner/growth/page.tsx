import { getLearnerGoals } from '@/dal/learner.dal'
import { PageShell, SectionHeading } from '@/components/learner/shared'
import { GoalsBoard } from '@/components/learner/goals-board'

export const metadata = { title: 'Growth — Creonex' }

export default async function LearnerGrowthPage(): Promise<React.ReactElement> {
  const goals = await getLearnerGoals()
  return (
    <PageShell>
      <SectionHeading title="Your growth" subtitle="Set goals and track what you want to learn." />
      <GoalsBoard initial={goals} />
    </PageShell>
  )
}
