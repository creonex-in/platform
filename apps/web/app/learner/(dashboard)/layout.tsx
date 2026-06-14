import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/shared/app-sidebar'
import { Toaster } from '@/components/ui/sonner'
import { requireLearner } from '@/lib/auth-guards'
import { getInitials } from '@/lib/utils'

export default async function LearnerLayout({ children }: { children: React.ReactNode }): Promise<React.ReactElement> {
  // Auth + learner-role gate (moved out of middleware).
  const user = await requireLearner()

  const displayName = user.name ?? 'Learner'

  return (
    <SidebarProvider>
      <AppSidebar role="learner" userName={displayName} userInitials={getInitials(displayName)} />
      <SidebarInset className="bg-muted/30 min-h-screen">
        {children}
      </SidebarInset>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  )
}
