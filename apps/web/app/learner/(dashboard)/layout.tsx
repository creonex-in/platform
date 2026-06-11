import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/shared/app-sidebar'
import { Toaster } from '@/components/ui/sonner'

export default function LearnerLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <SidebarProvider>
      <AppSidebar role="learner" userName="Arjun Kumar" userInitials="AK" />
      <SidebarInset>{children}</SidebarInset>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  )
}
