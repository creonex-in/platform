import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/shared/app-sidebar'
import { Toaster } from '@/components/ui/sonner'

export default function CreatorLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <SidebarProvider>
      <AppSidebar role="creator" userName="Meera Venkatesh" userInitials="MV" />
      <SidebarInset>{children}</SidebarInset>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  )
}
