'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LEARNER_PRIMARY_NAV } from '@/lib/nav'
import { cn } from '@/lib/utils'

// Account lives in the avatar menu (top-right), not here — no duplication.
const ITEMS = LEARNER_PRIMARY_NAV

/** Native-app-style bottom tab bar — mobile only. Primary destinations only;
 *  account actions live in the header avatar menu. */
export function LearnerBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-stretch pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <FontAwesomeIcon icon={item.icon} className="size-[18px]" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
