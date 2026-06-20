import { redirect } from 'next/navigation'
import { getCreatorContext } from '@/dal/users.dal'
import { requireAuth } from '@/lib/auth-guards'

export default async function CreatorOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.ReactElement> {
  // Must be signed in. Creator role is granted during the flow, so don't gate
  // on it here (would block step-1).
  await requireAuth()

  const { profile } = await getCreatorContext()

  // Single signal: isLive. Avoids loop if isLive/onboardingStatus are ever out of sync.
  if (profile?.isLive) {
    redirect('/creator')
  }

  return <>{children}</>
}
