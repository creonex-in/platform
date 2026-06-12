import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/shared/app-sidebar'
import { Toaster } from '@/components/ui/sonner'
import { getMe } from '@/dal/users.dal'
import { getInitials } from '@/lib/utils'

export default async function LearnerLayout({ children }: { children: React.ReactNode }): Promise<React.ReactElement> {
  const user = await getMe()
  if (!user) redirect('/sign-in')

  const displayName = user.name ?? 'Learner'

  return (
    <SidebarProvider>
      <AppSidebar role="learner" userName={displayName} userInitials={getInitials(displayName)} />
      <SidebarInset>{children}</SidebarInset>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  )
}
