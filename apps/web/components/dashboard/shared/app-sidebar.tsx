'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faHouse,
  faUserTie,
  faGraduationCap,
  faCalendarDays,
  faVideo,
  faBagShopping,
  faTableColumns,
  faCalendar,
  faBox,
  faUsers,
  faWallet,
  faGear,
  faFolderOpen,
  faDownload,
  faBookmark,
  faNoteSticky,
  faChartColumn,
  faComments,
  faUserPen,
  faRightFromBracket,
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
import { ContextTransition } from './context-transition'
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

const learnerNav: NavGroup[] = [
  {
    section: 'Discover',
    items: [
      { title: 'Home', href: '/learner/dashboard', icon: faHouse },
      { title: '1:1 Experts', href: '/learner/search', icon: faUserTie },
      { title: 'Courses', href: '/learner/courses', icon: faGraduationCap },
      { title: 'Workshops', href: '/learner/workshops', icon: faCalendarDays },
    ],
  },
  {
    section: 'My Activity',
    items: [
      { title: 'My Sessions', href: '/learner/sessions', icon: faVideo },
      { title: 'Purchases', href: '/learner/purchases', icon: faBagShopping },
    ],
  },
  {
    section: 'Library',
    items: [
      { title: 'Resources', href: '/learner/resources', icon: faFolderOpen },
      { title: 'Downloads', href: '/learner/downloads', icon: faDownload },
      { title: 'Bookmarks', href: '/learner/bookmarks', icon: faBookmark },
      { title: 'Notes', href: '/learner/notes', icon: faNoteSticky },
    ],
  },
  {
    section: 'Account',
    items: [{ title: 'Settings', href: '/learner/settings', icon: faGear }],
  },
]

const creatorNav: NavGroup[] = [
  {
    section: 'Manage',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: faTableColumns },
      { title: 'Bookings', href: '/bookings', icon: faCalendar },
      { title: 'My Offers', href: '/offers', icon: faBox },
      { title: 'Calendar', href: '/calendar', icon: faCalendarDays },
      { title: 'Payouts', href: '/payouts', icon: faWallet },
    ],
  },
  {
    section: 'Grow',
    items: [
      { title: 'Analytics', href: '/analytics', icon: faChartColumn },
      { title: 'Collaborate', href: '/collaborate', icon: faUsers },
      { title: 'Testimonials', href: '/testimonials', icon: faComments },
    ],
  },
  {
    section: 'Account',
    items: [
      { title: 'Edit Profile', href: '/edit-profile', icon: faUserPen },
      { title: 'Settings', href: '/settings', icon: faGear },
    ],
  },
]

interface AppSidebarProps {
  role: 'learner' | 'creator'
  userName?: string
  userInitials?: string
  isCreator?: boolean
}

export function AppSidebar({
  role,
  userName = 'Meera V.',
  userInitials = 'MV',
  isCreator = false,
}: AppSidebarProps): React.ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()
  const nav = role === 'creator' ? creatorNav : learnerNav
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleNavigate(): void {
    if (isMobile) setOpenMobile(false)
  }

  async function handleLogout(): Promise<void> {
    setLoggingOut(true)
    await authClient.signOut()
    router.push('/sign-in')
  }

  function handleSwitch(): void {
    startTransition(() => {
      router.push(role === 'creator' ? '/learner/dashboard' : '/dashboard')
    })
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
                {role === 'creator' ? 'Creator' : 'Learner'}
              </span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="gap-1 py-2">
          {nav.map((group) => (
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
          {role === 'creator' ? (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Learner Mode"
                  className="h-10 gap-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-primary/10 hover:from-blue-500/20 hover:to-primary/20 text-foreground font-medium border border-border/50 shadow-sm transition-all"
                  onClick={() => setSwitchOpen(true)}
                >
                  <FontAwesomeIcon icon={faGraduationCap} className="size-4 text-blue-500" />
                  <span>Switch to Learner</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : isCreator ? (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Creator Mode"
                  className="h-10 gap-3 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 hover:from-primary/20 hover:to-blue-500/20 text-foreground font-medium border border-border/50 shadow-sm transition-all"
                  onClick={() => setSwitchOpen(true)}
                >
                  <FontAwesomeIcon icon={faTableColumns} className="size-4 text-primary" />
                  <span>Switch to Creator</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : null}

          <div className="flex items-center gap-2.5 rounded-md px-1.5 py-2 mt-1">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-muted text-xs font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs capitalize text-muted-foreground">{role}</p>
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

      <ContextTransition 
        isVisible={isPending} 
        targetRole={role === 'creator' ? 'learner' : 'creator'} 
      />

      <AlertDialog open={switchOpen} onOpenChange={setSwitchOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to {role === 'creator' ? 'Learner' : 'Creator'} Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              {role === 'creator' 
                ? 'You are about to switch to the Learner Dashboard to discover courses, 1:1 sessions, and digital products. You can switch back at any time.'
                : 'You are about to switch to the Creator Dashboard to manage your bookings, offers, and analytics. You can switch back at any time.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault() // Keep dialog open while transitioning
                handleSwitch()
              }}
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? 'Switching...' : `Switch to ${role === 'creator' ? 'Learner' : 'Creator'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
