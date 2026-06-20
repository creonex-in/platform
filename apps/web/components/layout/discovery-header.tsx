'use client'

import Image from 'next/image'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { parseRoles } from '@creonex/types'
import { buttonVariants } from '@/components/ui/button'
import { MarketplaceSearch } from '@/components/layout/marketplace-search'
import { MobileSearchTrigger } from '@/components/layout/mobile-search'
import { UserMenu } from '@/components/layout/user-menu'
import { discoveryMenuNav } from '@/lib/nav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faHeart, faBell } from '@fortawesome/free-solid-svg-icons'
import { CategoriesMenu } from '@/components/layout/categories-menu'

export function DiscoveryHeader() {
  const { data: session, isPending } = authClient.useSession()

  const user = session?.user
  const isLoaded = !isPending
  const isCreator = user ? parseRoles(user.role ?? '').includes('creator') : false
  const menuItems = discoveryMenuNav(isCreator ? '/creator' : '/')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md h-16">
      <div className="flex h-full items-center px-4 sm:px-6 lg:px-8">
        
        {/* Mobile: Hamburger Menu (Left) */}
        <div className="flex md:hidden flex-1 items-center">
           <button className="text-foreground hover:text-primary transition-colors p-2 -ml-2">
              <FontAwesomeIcon icon={faBars} className="size-5" />
           </button>
        </div>

        {/* Logo (Left on Desktop, Center on Mobile) */}
        <div className="flex flex-1 md:flex-none justify-center md:justify-start">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image src="/logo.webp" alt="Creonex" width={28} height={28} className="dark:invert" />
            <span className="font-display text-[22px] font-bold tracking-tight text-foreground">
              creo<span className="text-primary">nex</span>
            </span>
          </Link>
        </div>

        {/* Categories Dropdown (Desktop) */}
        <CategoriesMenu />

        {/* Center — Dominant Search (Expands on Desktop) */}
        <div className="hidden md:flex flex-1 items-center min-w-0 ml-6 mr-6">
          <MarketplaceSearch className="w-full" />
        </div>

        {/* Right — Actions & Auth (Right on Mobile and Desktop) */}
        <div className="flex flex-1 md:flex-none items-center justify-end gap-3 sm:gap-4">
          <MobileSearchTrigger className="md:hidden" />

          {/* Right Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-[15px] font-medium text-muted-foreground mr-2">
            {!isCreator && (
              <Link href="/become-a-creator" className="hover:text-foreground transition-colors whitespace-nowrap">
                Become a Creator
              </Link>
            )}
            {isLoaded && user && !isCreator && (
              <Link href="/my-learning" className="hover:text-foreground transition-colors whitespace-nowrap">
                My Learning
              </Link>
            )}
          </div>

          {/* Auth / User Menu & Icons */}
          {isLoaded && user ? (
            <div className="flex items-center gap-5">
              <Link href="/wishlist" className="hidden sm:flex text-muted-foreground hover:text-foreground transition-colors">
                <FontAwesomeIcon icon={faHeart} className="size-[18px]" />
              </Link>
              <button className="hidden sm:flex text-muted-foreground hover:text-foreground transition-colors relative">
                <FontAwesomeIcon icon={faBell} className="size-[18px]" />
                <span className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
              </button>
              <UserMenu items={menuItems} />
            </div>
          ) : isLoaded ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/sign-in"
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border-2 border-foreground bg-transparent px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
              >
                Log in
              </Link>
              <Link 
                href="/sign-up/learner" 
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-foreground px-4 py-2 text-sm font-bold text-background transition-colors hover:bg-foreground/90"
              >
                Sign up
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
