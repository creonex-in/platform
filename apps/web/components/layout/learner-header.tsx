import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggleInline } from '@/components/layout/theme-toggle-inline'
import { MarketplaceSearch } from '@/components/layout/marketplace-search'
import { LearnerProfileMenu } from '@/components/layout/learner-profile-menu'
import { NotificationBell } from '@/components/layout/notification-bell'

interface LearnerHeaderProps {
  displayName: string
  avatarUrl?: string | null
  role: string
}

const NAV_LINKS = [
  { label: 'My Schedule', href: '/learner/schedule' },
  { label: 'My Library', href: '/learner/library' },
] as const

export function LearnerHeader({ displayName, avatarUrl }: LearnerHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full overflow-hidden border-b border-border/60 bg-background/95 backdrop-blur-md">
      {/* Holographic glow bleeding from behind the center of the bar */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[200%] w-[640px] -translate-x-1/2 -translate-y-1/2 opacity-40 blur-[60px] dark:opacity-70"
        style={{
          background:
            'linear-gradient(90deg,#f472b6,#c084fc,#818cf8,#60a5fa,#22d3ee,#34d399,#a3e635,#facc15,#fb923c,#f87171)',
        }}
      />

      <div className="relative mx-auto flex h-[60px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
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

        {/* Right — nav + profile */}
        <div className="flex shrink-0 items-center justify-end gap-4 sm:gap-5">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="hidden whitespace-nowrap text-[12px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground md:block"
            >
              {label}
            </Link>
          ))}

          {/* Profile dropdown */}
          <LearnerProfileMenu displayName={displayName} avatarUrl={avatarUrl} />

          {/* Bell + theme toggle */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggleInline />
          </div>
        </div>
      </div>
    </header>
  )
}
