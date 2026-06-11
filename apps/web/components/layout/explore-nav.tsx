'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { buttonVariants } from '@/components/ui/button'
import { CreatorDashboardButton } from '@/components/layout/creator-dashboard-button'
import { UserMenu } from '@/components/layout/user-menu'
import HeroSearch from '@/components/landing/shared/hero-search'

export function ExploreNav(): React.ReactElement {
  const { data: session, isPending } = authClient.useSession()
  const isSignedIn = !!session?.user
  const isLoaded = !isPending
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = (query: string) => {
    if (!query.trim()) return
    if (pathname === '/learner/search') {
      router.replace(`/learner/search?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push(`/learner/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="flex h-14 w-full items-center gap-3 px-3 sm:px-5 justify-between">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/logo.webp" alt="Creonex" width={28} height={28} className="size-7 object-contain" priority />
          <span className="hidden text-base font-bold tracking-tight sm:block">
            creo<span className="text-primary">nex</span>
          </span>
        </Link>

        {/* HeroSearch — desktop */}
        <div className="flex min-w-0 flex-1 max-sm:hidden max-w-sm">
          <HeroSearch onSearch={handleSearch} className="w-full" />
        </div>

        {/* Search icon — mobile only */}
        <Link href="/learner/search" className="shrink-0 sm:hidden text-muted-foreground">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="size-5" />
        </Link>

        {/* Auth — desktop */}
        <div className="flex shrink-0 items-center gap-2 max-sm:hidden">
          {isLoaded && !isSignedIn && (
            <>
              <Link href="/sign-in" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Login
              </Link>
              <Link href="/sign-up/learner" className={buttonVariants({ variant: 'default', size: 'sm' })}>
                Sign Up
              </Link>
            </>
          )}
          {isLoaded && isSignedIn && (
            <>
              <CreatorDashboardButton />
              <UserMenu />
            </>
          )}
        </div>

        {/* UserMenu — mobile */}
        {isLoaded && isSignedIn && (
          <div className="shrink-0 sm:hidden">
            <UserMenu />
          </div>
        )}

      </nav>
    </header>
  )
}
