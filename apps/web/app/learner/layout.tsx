import { requireLearner } from '@/lib/auth-guards'
import { LearnerHeader } from '@/components/layout/learner-header'

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.ReactElement> {
  const user = await requireLearner()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LearnerHeader
        displayName={user.name ?? user.email}
        avatarUrl={user.image}
        role={user.role}
      />
      <main className="flex-1">{children}</main>
    </div>
  )
}
