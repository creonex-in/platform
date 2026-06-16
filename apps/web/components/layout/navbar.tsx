'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { parseRoles } from '@creonex/types'
import { Button, buttonVariants } from '@/components/ui/button'
import MobileNav from '@/components/layout/mobile-nav'

type NavLink = { label: string; href: string }

type MarketingNavConfig = {
  centerLinks: NavLink[]
  ctaText: string
  ctaHref: string
}

const LEARNER_NAV: MarketingNavConfig = {
  centerLinks: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Explore Topics', href: '#explore' },
    { label: 'Top Creators', href: '/top-creators' },
    { label: 'For Creators', href: '/become-a-creator' },
  ],
  ctaText: 'Get Started Free',
  ctaHref: '/sign-up/learner',
}

const CREATOR_NAV: MarketingNavConfig = {
  centerLinks: [
    { label: 'Earn', href: '#monetize' },
    { label: 'Payments', href: '#payments' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'For Learners', href: '/' },
  ],
  ctaText: 'Grow on Creonex',
  ctaHref: '/sign-up/creator',
}

export default function Navbar(): React.ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const config = pathname === '/become-a-creator' ? CREATOR_NAV : LEARNER_NAV
  const isSignedIn = !!session?.user
  const isLoaded = !isPending

  function handleDashboard(): void {
    const roles = session ? parseRoles(session.user.role ?? '') : []
    router.push(roles.includes('creator') ? '/dashboard' : '/learner/dashboard')
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="page-container flex h-14 items-center justify-between">

        {/* Left — logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/logo.webp"
            alt="Creonex"
            width={28}
            height={28}
            className="size-7 object-contain dark:invert"
            priority
          />
          <span className="font-display text-base font-bold tracking-tight">
            creo<span className="text-primary">nex</span>
          </span>
        </Link>

        {/* Center — flat nav links (desktop) */}
        <nav className="hidden lg:flex items-center gap-6">
          {config.centerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right — auth-aware CTA */}
        <div className="flex items-center gap-3">
          {isLoaded && (
            <>
              {isSignedIn ? (
                <Button size="sm" onClick={handleDashboard}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="hidden sm:block text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link href={config.ctaHref} className={buttonVariants({ size: 'sm' })}>
                    {config.ctaText}
                  </Link>
                </>
              )}
            </>
          )}

          {/* Mobile hamburger */}
          <div className="lg:hidden">
            <MobileNav
              links={config.centerLinks}
              ctaText={config.ctaText}
              ctaHref={config.ctaHref}
              dashboardLink={
                isSignedIn
                  ? {
                      label: 'Go to Dashboard',
                      href: session && parseRoles(session.user.role ?? '').includes('creator')
                        ? '/dashboard'
                        : '/learner/dashboard',
                    }
                  : undefined
              }
            />
          </div>
        </div>

      </div>
    </header>
  )
}
