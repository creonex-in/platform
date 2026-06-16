'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faGaugeHigh,
  faBookOpen,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons'
import { authClient } from '@/lib/auth-client'
import { parseRoles } from '@creonex/types'
import { getInitials } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ThemeToggleInline } from '@/components/layout/theme-toggle-inline'
import { MarketplaceSearch } from '@/components/layout/marketplace-search'

/**
 * Global Discovery Header for the public marketplace (/explore,
 * /top-creators/[slug]). Logo · dominant shared search · contextual
 * auth state (logged in → My Library + avatar menu; else → Sign In + CTA).
 */
export function DiscoveryHeader() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const user = session?.user
  const displayName = user?.name || user?.email || ''
  const isLoaded = !isPending
  const dashboardHref =
    user && parseRoles(user.role ?? '').includes('creator')
      ? '/dashboard'
      : '/learner/dashboard'

  async function signOut(): Promise<void> {
    await authClient.signOut()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="relative flex h-[60px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        {/* Left — logo */}
        <Link href="/explore" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.webp"
            alt="Creonex"
            width={26}
            height={26}
            className="dark:invert"
          />
          <span className="font-display text-[16px] font-bold tracking-tight text-foreground">
            creo<span className="text-primary">nex</span>
          </span>
        </Link>

        {/* Center — dominant search */}
        <div className="flex flex-1 items-center justify-center">
          <MarketplaceSearch className="hidden w-full max-w-[560px] md:block" />
        </div>

        {/* Right — contextual auth state */}
        <div className="flex shrink-0 items-center justify-end gap-3 sm:gap-4">
          {isLoaded && user ? (
            <>
              <Link
                href="/learner/library"
                className="hidden whitespace-nowrap text-[12px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                My Library
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary/40">
                  <span className="size-8 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-1 ring-border">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={displayName}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[11px] font-bold text-primary">
                        {getInitials(displayName)}
                      </span>
                    )}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="hidden size-[10px] text-muted-foreground transition-colors group-hover:text-foreground sm:block"
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                  <div className="flex flex-col gap-0.5 px-1.5 py-1.5">
                    <span className="text-sm font-semibold text-foreground">{displayName}</span>
                    {user.email && (
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(dashboardHref)}>
                    <FontAwesomeIcon icon={faGaugeHigh} className="text-muted-foreground" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/learner/library')}>
                    <FontAwesomeIcon icon={faBookOpen} className="text-muted-foreground" />
                    My Library
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={signOut}>
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : isLoaded ? (
            <>
              <Link
                href="/sign-in"
                className="hidden whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign In
              </Link>
              <Link href="/sign-up/learner" className={buttonVariants({ size: 'sm' })}>
                Get Started
              </Link>
            </>
          ) : null}

          <ThemeToggleInline />
        </div>
      </div>
    </header>
  )
}
