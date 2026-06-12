import { redirect } from 'next/navigation'
import { getCreatorContext } from '@/dal/users.dal'

export default async function CreatorOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.ReactElement> {
  const { profile } = await getCreatorContext()

  // If the profile exists and onboarding is complete, redirect to dashboard
  if (profile && profile.onboardingStatus === 'complete') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
