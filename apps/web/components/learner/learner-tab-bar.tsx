'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse, faCalendarDays, faBookOpen, faBookmark,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { cn } from '@/lib/utils'

const TABS: { label: string; href: string; icon: IconDefinition }[] = [
  { label: 'Home', href: '/learner', icon: faHouse },
  { label: 'Schedule', href: '/learner/schedule', icon: faCalendarDays },
  { label: 'Library', href: '/learner/library', icon: faBookOpen },
  { label: 'Saved', href: '/learner/saved', icon: faBookmark },
]

export function LearnerTabBar(): React.ReactElement {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map((t) => {
          const active = t.href === '/learner' ? pathname === '/learner' : pathname.startsWith(t.href)
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <FontAwesomeIcon icon={t.icon} className="size-[18px]" />
              {t.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
