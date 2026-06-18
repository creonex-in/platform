import { requireLearner } from '@/lib/auth-guards'
import { LearnerHeader } from '@/components/layout/learner-header'
import { LearnerTabBar } from '@/components/learner/learner-tab-bar'
import { LearnerFooter } from '@/components/learner/learner-footer'

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.ReactElement> {
  const user = await requireLearner()

  return (
    <div className="theme-learner flex min-h-screen flex-col bg-background text-foreground">
      <LearnerHeader
        displayName={user.name ?? user.email}
        avatarUrl={user.image}
        role={user.role}
      />
      {/* extra bottom padding so the mobile tab bar never overlaps content */}
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <LearnerFooter />
      <LearnerTabBar />
    </div>
  )
}
