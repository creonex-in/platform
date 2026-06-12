import { redirect } from 'next/navigation'
import { getCreatorContext } from '@/dal/users.dal'

export default async function CreatorOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.ReactElement> {
  const { profile } = await getCreatorContext()

  // Single signal: isLive. Avoids loop if isLive/onboardingStatus are ever out of sync.
  if (profile?.isLive) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
