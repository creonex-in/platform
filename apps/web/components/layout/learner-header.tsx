import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggleInline } from '@/components/layout/theme-toggle-inline'
import { MarketplaceSearch } from '@/components/layout/marketplace-search'
import { LearnerProfileMenu } from '@/components/layout/learner-profile-menu'
import { LearnerNavLinks } from '@/components/layout/learner-nav-links'
import { NotificationBell } from '@/components/layout/notification-bell'
import { FindCreatorsMenu } from '@/components/layout/find-creators-menu'

interface LearnerHeaderProps {
  displayName: string
  avatarUrl?: string | null
  role: string
  email?: string
}

export function LearnerHeader({ displayName, avatarUrl, email }: LearnerHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left — logo + LEARNER badge */}
        <Link
          href="/learner"
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

        {/* Center — explore search */}
        <div className="relative flex flex-1 items-center justify-center">
          <MarketplaceSearch className="hidden w-full max-w-[480px] md:block" />
        </div>

        {/* Right — Find Creators dropdown + nav links + account */}
        <div className="flex shrink-0 items-center justify-end gap-4 sm:gap-5">
          <FindCreatorsMenu />
          <LearnerNavLinks />
          <LearnerProfileMenu displayName={displayName} avatarUrl={avatarUrl} email={email} />

          {/* Mobile search + bell + theme toggle */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggleInline />
          </div>
        </div>
      </div>
    </header>
  )
}
