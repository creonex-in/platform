'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faTableColumns,
  faCalendar,
  faBox,
  faCalendarDays,
  faWallet,
  faChartColumn,
  faUsers,
  faComments,
  faUserPen,
  faRightFromBracket,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { authClient } from '@/lib/auth-client'

interface NavItem {
  title: string
  href: string
  icon: IconDefinition
}

interface NavGroup {
  section: string
  items: NavItem[]
}

const creatorNav: NavGroup[] = [
  {
    section: 'Manage',
    items: [
      { title: 'Dashboard', href: '/creator', icon: faTableColumns },
      { title: 'Bookings', href: '/creator/bookings', icon: faCalendar },
      { title: 'My Offers', href: '/creator/offers', icon: faBox },
      { title: 'Calendar', href: '/creator/calendar', icon: faCalendarDays },
      { title: 'Payouts', href: '/creator/payouts', icon: faWallet },
    ],
  },
  {
    section: 'Grow',
    items: [
      { title: 'Analytics', href: '/creator/analytics', icon: faChartColumn },
      { title: 'Collaborate', href: '/creator/collaborate', icon: faUsers },
      { title: 'Testimonials', href: '/creator/testimonials', icon: faComments },
    ],
  },
  {
    section: 'Account',
    items: [
      { title: 'Edit Profile', href: '/creator/edit-profile', icon: faUserPen },
    ],
  },
]

interface AppSidebarProps {
  userName?: string
  userInitials?: string
}

export function AppSidebar({
  userName = 'Creator',
  userInitials = 'CR',
}: AppSidebarProps): React.ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  function handleNavigate(): void {
    if (isMobile) setOpenMobile(false)
  }

  async function handleLogout(): Promise<void> {
    setLoggingOut(true)
    await authClient.signOut()
    router.push('/sign-in')
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-14 justify-center px-3">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <Image
              src="/logo.webp"
              alt="Creonex"
              width={28}
              height={28}
              className="size-7 shrink-0 object-contain dark:invert"
              priority
            />
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-base font-bold tracking-tight leading-none">
                creo<span className="text-primary">nex</span>
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground mt-1">
                Creator
              </span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="gap-1 py-2">
          {creatorNav.map((group) => (
            <SidebarGroup key={group.section} className="py-1">
              <SidebarGroupLabel>{group.section}</SidebarGroupLabel>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.title}
                        className="h-9 gap-3 rounded-lg data-active:bg-primary/10 data-active:font-semibold data-active:text-primary data-active:hover:bg-primary/15"
                        onClick={handleNavigate}
                        render={<Link href={item.href} />}
                      >
                        <FontAwesomeIcon icon={item.icon} className="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-2 gap-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Explore as Learner"
                className="h-9 gap-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                render={<Link href="/" />}
              >
                <FontAwesomeIcon icon={faGraduationCap} className="size-4" />
                <span>Want to learn? Explore</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="flex items-center gap-2.5 rounded-md px-1.5 py-2">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-muted text-xs font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs capitalize text-muted-foreground">creator</p>
            </div>
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Log out"
                className="h-9 gap-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                onClick={() => setLogoutOpen(true)}
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="size-4" />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20"
            >
              {loggingOut ? 'Logging out…' : 'Log out'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
