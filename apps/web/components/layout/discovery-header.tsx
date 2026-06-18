'use client'

import Image from 'next/image'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { parseRoles } from '@creonex/types'
import { buttonVariants } from '@/components/ui/button'
import { ThemeToggleInline } from '@/components/layout/theme-toggle-inline'
import { MarketplaceSearch } from '@/components/layout/marketplace-search'
import { MobileSearchTrigger } from '@/components/layout/mobile-search'
import { UserMenu } from '@/components/layout/user-menu'
import { discoveryMenuNav } from '@/lib/nav'

/**
 * Global Discovery Header for the public marketplace (/explore,
 * /top-creators/[slug]). Logo · dominant shared search · contextual
 * auth state (logged in → shared UserMenu; else → Sign In + CTA).
 */
export function DiscoveryHeader() {
  const { data: session, isPending } = authClient.useSession()

  const user = session?.user
  const isLoaded = !isPending
  const isCreator = user ? parseRoles(user.role ?? '').includes('creator') : false
  const menuItems = discoveryMenuNav(isCreator ? '/dashboard' : '/learner/dashboard')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="relative flex h-[60px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        {/* Left — logo */}
        <Link href="/explore" className="flex shrink-0 items-center gap-2.5">
          <Image src="/logo.webp" alt="Creonex" width={26} height={26} className="dark:invert" />
          <span className="font-display text-[16px] font-bold tracking-tight text-foreground">
            creo<span className="text-primary">nex</span>
          </span>
        </Link>

        {/* Center — dominant search (desktop) */}
        <div className="flex flex-1 items-center justify-center">
          <MarketplaceSearch className="hidden w-full max-w-[560px] md:block" />
        </div>

        {/* Right — contextual auth state */}
        <div className="flex shrink-0 items-center justify-end gap-3 sm:gap-4">
          <MobileSearchTrigger className="md:hidden" />

          {isLoaded && user ? (
            <UserMenu items={menuItems} />
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
