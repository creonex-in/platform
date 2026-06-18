'use client'

import { useRouter, usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface UserMenuItem {
  label: string
  href: string
  icon?: IconDefinition
}

interface UserMenuProps {
  /** Contextual nav rendered inside the menu, highlighted on the active route. */
  items?: UserMenuItem[]
  align?: 'start' | 'end'
  /** Hide the name label next to the avatar (avatar-only trigger). */
  compact?: boolean
  /** Optional identity overrides (e.g. server-fetched). Falls back to the session. */
  name?: string
  email?: string | null
  avatarUrl?: string | null
}

/**
 * The single account menu used by every navbar (learner, discovery, …).
 * shadcn Avatar + DropdownMenu only. Identity comes from the session; the nav
 * links are passed per-surface via `items` and auto-highlight the active route,
 * so a learner or creator can always navigate out of wherever they are.
 */
export function UserMenu({
  items = [], align = 'end', compact = false, name, email, avatarUrl,
}: UserMenuProps): React.ReactElement | null {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = authClient.useSession()

  const user = session?.user
  if (!user) return null

  const displayName = name || user.name || user.email || 'Account'
  const displayEmail = email ?? user.email
  const image = avatarUrl ?? user.image
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  async function signOut() {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex items-center gap-2 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label="Account menu"
      >
        <Avatar className="size-8 ring-1 ring-border">
          {image ? <AvatarImage src={image} alt={displayName} /> : null}
          <AvatarFallback className="bg-primary/10 text-[11px] font-bold text-primary">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        {!compact && (
          <span className="hidden max-w-28 truncate text-[13px] font-medium text-foreground sm:block">
            {displayName.split(' ')[0]}
          </span>
        )}
        <FontAwesomeIcon
          icon={faChevronDown}
          className="hidden size-[10px] text-muted-foreground transition-colors group-hover:text-foreground sm:block"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} sideOffset={8} className="w-60">
        <div className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="truncate text-sm font-semibold text-foreground">{displayName}</span>
          {displayEmail && <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>}
        </div>

        {items.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {items.map((item) => {
              const active = isActive(item.href)
              return (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(active && 'bg-muted font-medium text-foreground')}
                >
                  {item.icon && (
                    <FontAwesomeIcon
                      icon={item.icon}
                      className={cn(active ? 'text-primary' : 'text-muted-foreground')}
                    />
                  )}
                  {item.label}
                </DropdownMenuItem>
              )
            })}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <FontAwesomeIcon icon={faRightFromBracket} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
