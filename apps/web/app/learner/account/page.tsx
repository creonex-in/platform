import { requireLearner } from '@/lib/auth-guards'
import { getLearnerProfile } from '@/dal/learner.dal'
import { PageShell, SectionHeading } from '@/components/learner/shared'
import { AccountForm } from '@/components/learner/account-form'

export const metadata = { title: 'Account — Creonex' }

export default async function LearnerAccountPage(): Promise<React.ReactElement> {
  const [user, profile] = await Promise.all([requireLearner(), getLearnerProfile()])
  return (
    <PageShell>
      <SectionHeading title="Account" subtitle="Your goal and the topics you care about." />
      <AccountForm profile={profile} displayName={user.name ?? user.email} email={user.email} />
    </PageShell>
  )
}
