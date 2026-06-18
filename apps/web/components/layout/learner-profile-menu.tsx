'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faGear, faRightFromBracket, faChalkboardUser } from '@fortawesome/free-solid-svg-icons'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'
import { getInitials } from '@/lib/utils'

export function LearnerProfileMenu({
  displayName, avatarUrl,
}: {
  displayName: string
  avatarUrl?: string | null
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

      <DropdownMenuContent align="end" className="w-52 rounded-xl">
        <div className="truncate px-2 py-1.5 text-sm font-semibold text-foreground">{displayName}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="rounded-lg" onClick={() => router.push('/learner/account')}>
          <FontAwesomeIcon icon={faGear} className="size-3.5 mr-2.5 text-muted-foreground" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg" onClick={() => router.push('/dashboard')}>
          <FontAwesomeIcon icon={faChalkboardUser} className="size-3.5 mr-2.5 text-muted-foreground" />
          Switch to Creator
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="rounded-lg" onClick={logout}>
          <FontAwesomeIcon icon={faRightFromBracket} className="size-3.5 mr-2.5" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
