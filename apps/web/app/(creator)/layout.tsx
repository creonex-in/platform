import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/shared/app-sidebar'
import { Toaster } from '@/components/ui/sonner'
import { getCreatorContext } from '@/dal/users.dal'
import { getInitials } from '@/lib/utils'

const STEP_PATHS: Record<number, string> = {
  1: '/onboarding/creator/step-1',
  2: '/onboarding/creator/step-2',
  3: '/onboarding/creator/step-3',
  4: '/onboarding/creator/step-4',
}

export default async function CreatorLayout({ children }: { children: React.ReactNode }): Promise<React.ReactElement> {
  const { user, profile } = await getCreatorContext()

  // Single signal: isLive. Avoids loop if isLive/onboardingStatus are ever out of sync.
  if (!profile?.isLive) {
    redirect(profile ? (STEP_PATHS[profile.currentStep] ?? '/onboarding/creator/step-1') : '/onboarding/creator/step-1')
  }

  const displayName = profile?.displayName ?? user?.name ?? 'Creator'

  return (
    <SidebarProvider>
      <AppSidebar role="creator" userName={displayName} userInitials={getInitials(displayName)} />
      <SidebarInset>{children}</SidebarInset>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  )
}
