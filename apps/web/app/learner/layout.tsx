import { requireLearner } from '@/lib/auth-guards'
import { LearnerHeader } from '@/components/layout/learner-header'
import { LearnerTabBar } from '@/components/learner/learner-tab-bar'
import { CommandPalette } from '@/components/learner/command-palette'
import { needsLearnerOnboarding } from '@/dal/users.dal'
import { LearnerOnboardingDialog } from '@/components/onboarding/learner/onboarding-dialog'

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.ReactElement> {
  const [user, showOnboarding] = await Promise.all([
    requireLearner(),
    needsLearnerOnboarding(),
  ])

  return (
    <div className="theme-learner min-h-screen bg-background text-foreground">
      <LearnerHeader
        displayName={user.name ?? user.email}
        avatarUrl={user.image}
        role={user.role}
      />
      {/* extra bottom padding so the mobile tab bar never overlaps content */}
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <LearnerTabBar />
      <CommandPalette />
      {showOnboarding && <LearnerOnboardingDialog defaultOpen />}
    </div>
  )
}
