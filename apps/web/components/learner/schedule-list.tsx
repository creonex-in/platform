'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { buttonVariants } from '@/components/ui/button'
import { SessionCard } from './session-card'
import { EmptyState, isUpcoming } from './shared'
import { cn } from '@/lib/utils'
import type { LearnerBookingItem } from '@creonex/types'

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
] as const

export function ScheduleList({ bookings }: { bookings: LearnerBookingItem[] }): React.ReactElement {
  const router = useRouter()
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  // Sessions = non-digital bookings (1:1 + live events)
  const sessions = bookings.filter((b) => b.offeringType !== 'digital')
  const active = sessions.filter(
    (b) => (b.status === 'confirmed' || b.status === 'pending_payment') && isUpcoming(b.startTime),
  )
  const past = sessions.filter((b) => !active.includes(b))
  const shown = tab === 'upcoming' ? active : past

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-full border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              tab === t.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">{t.value === 'upcoming' ? active.length : past.length}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={faCalendarDays}
          title={tab === 'upcoming' ? 'No upcoming sessions' : 'Nothing in the past yet'}
          description={tab === 'upcoming' ? 'Book a session or workshop to see it here.' : 'Your completed sessions will appear here.'}
          action={
            tab === 'upcoming' ? (
              <Link href="/explore" className={cn(buttonVariants({ size: 'sm' }), 'rounded-lg')}>Explore creators</Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {shown.map((b) => (
            <SessionCard key={b.id} booking={b} onChanged={() => router.refresh()} />
          ))}
        </div>
      )}
    </div>
  )
}
