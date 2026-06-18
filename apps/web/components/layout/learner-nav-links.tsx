'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LEARNER_PRIMARY_NAV } from '@/lib/nav'
import { cn } from '@/lib/utils'

// Home is represented by the logo, so skip it in the text-link row.
// Home is represented by the logo — skip it from the text-link row
const LINKS = LEARNER_PRIMARY_NAV.filter((n) => n.href !== '/learner')

/** Desktop primary nav for the learner header. Mobile uses the bottom tab bar. */
export function LearnerNavLinks() {
  const pathname = usePathname()
  return (
    <nav className="hidden items-center gap-6 md:flex">
      {LINKS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'whitespace-nowrap text-[12px] font-semibold uppercase tracking-wide transition-colors',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
