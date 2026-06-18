import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import { ThemeToggleInline } from '@/components/layout/theme-toggle-inline'
import { MarketplaceSearch } from '@/components/layout/marketplace-search'
import { MobileSearchTrigger } from '@/components/layout/mobile-search'
import { LearnerNavLinks } from '@/components/layout/learner-nav-links'
import { UserMenu } from '@/components/layout/user-menu'
import { LEARNER_ACCOUNT_NAV } from '@/lib/nav'

interface LearnerHeaderProps {
  displayName: string
  avatarUrl?: string | null
  role: string
}

export function LearnerHeader({ displayName, avatarUrl }: LearnerHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      {/* Glow clipped to the bar only — overflow-hidden lives here, NOT on the
          header, so the search suggestions dropdown can overflow below it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[200%] w-[640px] -translate-x-1/2 -translate-y-1/2 opacity-40 blur-[60px] dark:opacity-70"
          style={{
            background:
              'linear-gradient(90deg,#f472b6,#c084fc,#818cf8,#60a5fa,#22d3ee,#34d399,#a3e635,#facc15,#fb923c,#f87171)',
          }}
        />
      </div>

      <div className="relative flex h-[60px] items-center gap-4 px-4 sm:px-6">
        {/* Left — logo + LEARNER badge */}
        <Link
          href="/learner/dashboard"
          className="flex shrink-0 items-center gap-3"
        >
          <Image
            src="/logo.webp"
            alt="Creonex"
            width={24}
            height={24}
            className="dark:invert"
          />
          <div className="flex flex-col justify-center leading-none">
            <span className="font-display text-[16px] font-bold tracking-tight text-foreground">
              creo<span className="text-primary">nex</span>
            </span>
            <span className="mt-[2px] text-[10px] font-bold uppercase tracking-[0.14em] text-primary/80">
              Learner
            </span>
          </div>
        </Link>

        {/* Center — search */}
        <div className="relative flex flex-1 items-center justify-center">
          <MarketplaceSearch className="hidden w-full max-w-[500px] md:block" />
        </div>

        {/* Right — primary nav (desktop) + account */}
        <div className="flex shrink-0 items-center justify-end gap-4 sm:gap-5">
          <LearnerNavLinks />

          {/* Account menu — identity + account + sign out only (no section nav) */}
          <UserMenu items={LEARNER_ACCOUNT_NAV} name={displayName} avatarUrl={avatarUrl} />

          {/* Mobile search + bell + theme toggle */}
          <div className="flex items-center gap-2">
            <MobileSearchTrigger className="md:hidden" />
            <button
              type="button"
              aria-label="Notifications"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-muted/50 text-foreground transition-colors hover:bg-muted"
            >
              <FontAwesomeIcon icon={faBell} className="size-[15px]" />
            </button>
            <ThemeToggleInline />
          </div>
        </div>
      </div>
    </header>
  )
}
