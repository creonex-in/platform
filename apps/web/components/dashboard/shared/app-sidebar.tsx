'use client'

import { usePathname } from 'next/navigation'
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
  faStar,
  faWallet,
  faGear,
  faFolderOpen,
  faDownload,
  faBookmark,
  faNoteSticky,
  faEnvelope,
  faBolt,
  faChartColumn,
  faComments,
  faUserPen,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
      { title: 'Priority DM', href: '/priority-dm', icon: faEnvelope },
      { title: 'My Offers', href: '/offers', icon: faBox },
      { title: 'Calendar', href: '/calendar', icon: faCalendarDays },
      { title: 'Auto DM', href: '/auto-dm', icon: faBolt },
      { title: 'Payouts', href: '/payouts', icon: faWallet },
    ],
  },
  {
    section: 'Grow',
    items: [
      { title: 'Analytics', href: '/analytics', icon: faChartColumn },
      { title: 'CQS Score', href: '/cqs', icon: faStar },
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
}

export function AppSidebar({
  role,
  userName = 'Meera V.',
  userInitials = 'MV',
}: AppSidebarProps): React.ReactElement {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const nav = role === 'creator' ? creatorNav : learnerNav

  function handleNavigate(): void {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center px-3">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <Image
            src="/logo.webp"
            alt="Creonex"
            width={28}
            height={28}
            className="size-7 shrink-0 object-contain"
            priority
          />
          <span className="truncate text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            creo<span className="text-primary">nex</span>
          </span>
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

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1">
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
      </SidebarFooter>
    </Sidebar>
  )
}
