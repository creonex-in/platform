'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown, faGear, faRightFromBracket, faChalkboardUser,
  faHouse, faCalendarDays, faBookOpen, faBookmark,
} from '@fortawesome/free-solid-svg-icons'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'
import { getInitials } from '@/lib/utils'

export function LearnerProfileMenu({
  displayName, avatarUrl, email,
}: {
  displayName: string
  avatarUrl?: string | null
  email?: string
}): React.ReactElement {
  const router = useRouter()
  const firstName = displayName.split(' ')[0]
  const initials = getInitials(displayName)

  async function logout(): Promise<void> {
    await authClient.signOut()
    router.push('/sign-in')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button type="button" className="group flex items-center gap-2.5 outline-none transition-opacity hover:opacity-80" />
        }
      >
        <span className="size-8 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-1 ring-border">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={displayName} width={32} height={32} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[11px] font-bold text-primary">{initials}</span>
          )}
        </span>
        <span className="hidden whitespace-nowrap text-[13px] font-medium text-foreground sm:block">{firstName}</span>
        <FontAwesomeIcon icon={faChevronDown} className="hidden size-[10px] text-muted-foreground transition-colors group-hover:text-foreground sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 rounded-xl p-0">
        {/* Udemy-style header: large avatar + name + email */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-2 ring-border">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={displayName} fill className="object-cover" sizes="48px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-base font-bold text-primary">{initials}</span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
            {email && <p className="truncate text-[12px] text-muted-foreground">{email}</p>}
          </div>
        </div>

        {/* Navigation links */}
        <div className="py-1.5">
          <DropdownMenuItem
            className="gap-3 rounded-none px-4 py-2.5 text-sm"
            onClick={() => router.push('/learner')}
          >
            <FontAwesomeIcon icon={faHouse} className="size-3.5 text-muted-foreground" />
            My Learning
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-3 rounded-none px-4 py-2.5 text-sm"
            onClick={() => router.push('/learner/schedule')}
          >
            <FontAwesomeIcon icon={faCalendarDays} className="size-3.5 text-muted-foreground" />
            Schedule
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-3 rounded-none px-4 py-2.5 text-sm"
            onClick={() => router.push('/learner/library')}
          >
            <FontAwesomeIcon icon={faBookOpen} className="size-3.5 text-muted-foreground" />
            Library
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-3 rounded-none px-4 py-2.5 text-sm"
            onClick={() => router.push('/learner/saved')}
          >
            <FontAwesomeIcon icon={faBookmark} className="size-3.5 text-muted-foreground" />
            Saved
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="py-1.5">
          <DropdownMenuItem
            className="gap-3 rounded-none px-4 py-2.5 text-sm"
            onClick={() => router.push('/learner/account')}
          >
            <FontAwesomeIcon icon={faGear} className="size-3.5 text-muted-foreground" />
            Account settings
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-3 rounded-none px-4 py-2.5 text-sm"
            onClick={() => router.push('/dashboard')}
          >
            <FontAwesomeIcon icon={faChalkboardUser} className="size-3.5 text-muted-foreground" />
            Switch to Creator
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="py-1.5">
          <DropdownMenuItem
            variant="destructive"
            className="gap-3 rounded-none px-4 py-2.5 text-sm"
            onClick={logout}
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="size-3.5" />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
