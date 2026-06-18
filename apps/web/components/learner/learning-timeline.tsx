'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck, faClock, faVideo, faFileArrowDown, faXmark, faUsers, faArrowRight,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Button } from '@/components/ui/button'
import { learnerService } from '@/services/learner.service'
import { isApiError } from '@/lib/api'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { formatWhen, isUpcoming, Spinner } from './shared'
import type { LearnerBookingItem } from '@creonex/types'

type Dot = { icon: IconDefinition; ring: string; bg: string }

function dotFor(b: LearnerBookingItem): Dot {
  if (b.status === 'cancelled' || b.status === 'refunded')
    return { icon: faXmark, ring: 'border-border', bg: 'bg-muted text-muted-foreground' }
  if (b.offeringType === 'digital')
    return { icon: faFileArrowDown, ring: 'border-[var(--pastel-sky)]/40', bg: 'bg-[var(--pastel-sky)]/15 text-[var(--pastel-sky)]' }
  if (b.status === 'pending_payment')
    return { icon: faClock, ring: 'border-amber-500/40', bg: 'bg-amber-500/15 text-amber-500' }
  if (b.status === 'confirmed' && isUpcoming(b.startTime))
    return { icon: faCheck, ring: 'border-emerald-500/40', bg: 'bg-emerald-500/15 text-emerald-500' }
  return { icon: faCheck, ring: 'border-border', bg: 'bg-muted text-muted-foreground' }
}

function rowLabel(b: LearnerBookingItem): string {
  if (b.offeringType === 'digital') return 'Digital product'
  if (b.offeringType === 'live_event') return b.format === 'webinar' ? 'Webinar' : 'Workshop'
  return isUpcoming(b.startTime) ? 'Upcoming 1:1' : 'Past 1:1'
}

function TimelineRow({ b, last }: { b: LearnerBookingItem; last: boolean }): React.ReactElement {
  const [loading, setLoading] = useState(false)
  const dot = dotFor(b)
  const joinable = b.offeringType !== 'digital' && b.status === 'confirmed' && isUpcoming(b.startTime) && !!b.meetingUrl

  async function download(): Promise<void> {
    setLoading(true)
    try {
      const a = await learnerService.getDigitalAccess(b.id)
      const url = a.externalUrl ?? a.files?.[0]?.url
      if (!url) { toast.error('No download available yet'); return }
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not get download.')
    } finally { setLoading(false) }
  }

  return (
    <div className="relative flex gap-4 pb-5 last:pb-0">
      {/* rail + dot */}
      <div className="relative flex flex-col items-center">
        <span className={cn('z-10 flex size-7 items-center justify-center rounded-full border-2 bg-background', dot.ring)}>
          <span className={cn('flex size-5 items-center justify-center rounded-full', dot.bg)}>
            <FontAwesomeIcon icon={dot.icon} className="size-2.5" />
          </span>
        </span>
        {!last && <span className="absolute top-7 h-full w-px bg-border" />}
      </div>

      {/* card */}
      <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/70">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{rowLabel(b)}</p>
          <p className="truncate text-[15px] font-semibold text-foreground">{b.offeringTitle}</p>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
            {b.offeringType === 'digital'
              ? (b.creatorName ?? 'Ready to download')
              : `${b.creatorName ?? ''}${b.startTime ? ` · ${formatWhen(b.startTime)}` : ''}`}
          </p>
        </div>

        <div className="shrink-0">
          {joinable ? (
            <Button size="sm" className="h-8 rounded-lg" nativeButton={false}
              render={<a href={b.meetingUrl!} target="_blank" rel="noopener noreferrer" />}>
              <FontAwesomeIcon icon={faVideo} className="size-3 mr-1.5" /> Join
            </Button>
          ) : b.offeringType === 'digital' ? (
            <Button size="sm" variant="outline" className="h-8 rounded-lg" disabled={loading} onClick={download}>
              {loading ? <Spinner /> : <><FontAwesomeIcon icon={faFileArrowDown} className="size-3 mr-1.5" /> Download</>}
            </Button>
          ) : (
            <span className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground">
              <FontAwesomeIcon icon={faUsers} className="size-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function LearningTimeline({ items }: { items: LearnerBookingItem[] }): React.ReactElement {
  const active = items.filter((b) => b.status === 'confirmed').length

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-foreground">
            {items.length} {items.length === 1 ? 'booking' : 'bookings'}
            <span className="text-muted-foreground"> · {active} active</span>
          </p>
          <Link href="/learner/schedule" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all <FontAwesomeIcon icon={faArrowRight} className="size-3" />
          </Link>
        </div>
        <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${items.length ? Math.round((active / items.length) * 100) : 0}%` }} />
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border bg-card/40 p-5">
        {items.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No activity yet — book a session or buy a product to start your timeline.
          </div>
        ) : (
          <div>
            {items.map((b, i) => <TimelineRow key={b.id} b={b} last={i === items.length - 1} />)}
          </div>
        )}
      </div>
    </div>
  )
}
