import { requireLearner } from '@/lib/auth-guards'
import { getLearnerProfile } from '@/dal/learner.dal'
import { PageShell, SectionHeading } from '@/components/learner/shared'
import { AccountForm } from '@/components/learner/account-form'

export const metadata = { title: 'Account — Creonex' }

export default async function LearnerAccountPage(): Promise<React.ReactElement> {
  const [user, profile] = await Promise.all([requireLearner(), getLearnerProfile()])
  return (
    <PageShell>
      <SectionHeading title="Settings" subtitle="Manage your profile and learning preferences." />
      <AccountForm
        profile={profile}
        name={user.name ?? ''}
        email={user.email}
        image={user.image ?? null}
      />
    </PageShell>
  )
}
