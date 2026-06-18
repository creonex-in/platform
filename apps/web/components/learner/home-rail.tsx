'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar, faFileArrowDown, faClockRotateLeft, faVault, faVideo,
} from '@fortawesome/free-solid-svg-icons'
import { learnerService } from '@/services/learner.service'
import { isApiError } from '@/lib/api'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { formatWhen, StatusBadge } from './shared'
import type { LearnerBookingItem } from '@creonex/types'

function RailCard({ title, icon, children, href }: {
  title: string; icon: typeof faVault; children: React.ReactNode; href?: string
}): React.ReactElement {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
          <FontAwesomeIcon icon={icon} className="size-4 text-primary" /> {title}
        </h3>
        {href && <Link href={href} className="text-sm font-semibold text-primary hover:underline">All</Link>}
      </div>
      {children}
    </div>
  )
}

function VaultTile({ b }: { b: LearnerBookingItem }): React.ReactElement {
  const [loading, setLoading] = useState(false)
  async function download(): Promise<void> {
    setLoading(true)
    try {
      const a = await learnerService.getDigitalAccess(b.id)
      const url = a.externalUrl ?? a.files?.[0]?.url
      if (!url) { toast.error('No download available yet'); return }
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) { toast.error(isApiError(e) ? e.message : 'Could not download.') }
    finally { setLoading(false) }
  }
  return (
    <button
      type="button" onClick={download} disabled={loading} title={b.offeringTitle}
      className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 p-2 text-center transition-colors hover:border-primary/40 hover:bg-muted/60 disabled:opacity-60"
    >
      <FontAwesomeIcon icon={faFileArrowDown} className={cn('size-5 text-[var(--pastel-sage)]', loading && 'animate-pulse')} />
      <span className="line-clamp-1 w-full text-[10px] font-medium text-muted-foreground">{b.offeringTitle}</span>
    </button>
  )
}

export function HomeRail({ upcoming, digital, past }: {
  upcoming: LearnerBookingItem[]
  digital: LearnerBookingItem[]
  past: LearnerBookingItem[]
}): React.ReactElement {
  return (
    <div className="space-y-4">
      <RailCard title="Upcoming sessions" icon={faCalendar} href="/learner/schedule">
        {upcoming.length === 0 ? (
          <p className="py-2 text-xs text-muted-foreground">No upcoming sessions.</p>
        ) : (
          <ul className="space-y-2.5">
            {upcoming.slice(0, 3).map((b) => (
              <li key={b.id} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  <FontAwesomeIcon icon={b.meetingUrl ? faVideo : faCalendar} className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-foreground">{b.offeringTitle}</p>
                  <p className="truncate text-[13px] text-muted-foreground">{formatWhen(b.startTime)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </RailCard>

      <RailCard title="My digital vault" icon={faVault} href="/learner/library">
        {digital.length === 0 ? (
          <p className="py-2 text-xs text-muted-foreground">No purchases yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {digital.slice(0, 6).map((b) => <VaultTile key={b.id} b={b} />)}
          </div>
        )}
      </RailCard>

      <RailCard title="Past bookings" icon={faClockRotateLeft} href="/learner/schedule">
        {past.length === 0 ? (
          <p className="py-2 text-xs text-muted-foreground">Nothing here yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {past.slice(0, 3).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[15px] text-foreground">{b.offeringTitle}</span>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </RailCard>
    </div>
  )
}
