'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck, faCircle, faExclamationTriangle, faLock, faFileLines,
  faVideo, faFileArrowDown, faArrowRight, faUser, faClock
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { learnerService } from '@/services/learner.service'
import { isApiError } from '@/lib/api'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { isUpcoming, Spinner } from './shared'
import type { LearnerBookingItem } from '@creonex/types'
import { CreatorAvatar } from '../explore/session-card'

type Dot = { icon: any; ring: string; bg: string }

function dotFor(b: LearnerBookingItem): Dot {
  if (b.status === 'cancelled' || b.status === 'refunded') {
    return { icon: faExclamationTriangle, ring: 'border-amber-500/40', bg: 'bg-amber-500/10 text-amber-500' }
  }
  if (b.offeringType === 'digital') {
    return { icon: faCircle, ring: 'border-primary/40', bg: 'bg-primary/10 text-primary' }
  }
  if (b.offeringType === 'live_event') {
    return { icon: faLock, ring: 'border-muted-foreground/40', bg: 'bg-muted text-muted-foreground' }
  }
  if (b.status === 'confirmed' && isUpcoming(b.startTime)) {
    return { icon: faCheck, ring: 'border-emerald-500/40', bg: 'bg-emerald-500/10 text-emerald-500' }
  }
  // Completed / Past
  return { icon: faCheck, ring: 'border-emerald-500/40', bg: 'bg-emerald-500/10 text-emerald-500' }
}

function TimelineRow({
  b,
  last,
  index,
}: {
  b: LearnerBookingItem
  last: boolean
  index: number
}): React.ReactElement {
  const [loading, setLoading] = useState(false)
  const dot = dotFor(b)
  const upcoming = isUpcoming(b.startTime) && b.status === 'confirmed'

  async function download(): Promise<void> {
    setLoading(true)
    try {
      const a = await learnerService.getDigitalAccess(b.id)
      const url = a.externalUrl ?? a.files?.[0]?.url
      if (!url) {
        toast.error('No download available yet')
        return
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not get download.')
    } finally {
      setLoading(false)
    }
  }

  // 1. Digital product card template
  if (b.offeringType === 'digital') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="relative flex gap-4 pb-6 last:pb-0"
      >
        <div className="relative flex flex-col items-center">
          <span className={cn('z-10 flex size-8 items-center justify-center rounded-full border-2 bg-background', dot.ring)}>
            <span className={cn('flex size-6 items-center justify-center rounded-full', dot.bg)}>
              <FontAwesomeIcon icon={dot.icon} className="size-2" />
            </span>
          </span>
          {!last && <span className="absolute top-8 h-full w-px bg-border/60" />}
        </div>

        <div className="flex flex-1 items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.12)] hover:border-border/60 transition-all duration-300">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FontAwesomeIcon icon={faFileLines} className="size-5" />
            </span>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-foreground truncate">{b.offeringTitle}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">File size: 32.6 MB</p>
            </div>
          </div>
          <Button
            size="default"
            disabled={loading}
            onClick={download}
            className="h-10 rounded-xl px-4 text-xs font-bold shrink-0"
          >
            {loading ? (
              <Spinner />
            ) : (
              <>
                <FontAwesomeIcon icon={faFileArrowDown} className="size-3.5 mr-1.5" />
                Download
              </>
            )}
          </Button>
        </div>
      </motion.div>
    )
  }

  // 2. Upcoming confirmed session (Portfolio Review style)
  if (b.offeringType === 'one_on_one' && upcoming) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="relative flex gap-4 pb-6 last:pb-0"
      >
        <div className="relative flex flex-col items-center">
          <span className={cn('z-10 flex size-8 items-center justify-center rounded-full border-2 bg-background', dot.ring)}>
            <span className={cn('flex size-6 items-center justify-center rounded-full', dot.bg)}>
              <FontAwesomeIcon icon={dot.icon} className="size-3" />
            </span>
          </span>
          {!last && <span className="absolute top-8 h-full w-px bg-border/60" />}
        </div>

        <div className="flex flex-1 items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.12)] hover:border-border/60 transition-all duration-300">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Upcoming 1:1</span>
            <h4 className="text-base font-bold text-foreground mt-0.5 truncate">{b.offeringTitle}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Creator: {b.creatorName ?? 'Alex'}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
            {b.meetingUrl && (
              <span className="text-xs text-primary/80 font-medium truncate max-w-[140px] sm:max-w-none">
                Zoom link: <a href={b.meetingUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{b.meetingUrl}</a>
              </span>
            )}
            <Button
              size="default"
              className="h-10 rounded-xl px-5 text-xs font-bold"
              nativeButton={false}
              render={<a href={b.meetingUrl ?? '#'} target="_blank" rel="noopener noreferrer" />}
            >
              Join
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // 3. Locked/Live event card style (Live Sprint style)
  if (b.offeringType === 'live_event') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="relative flex gap-4 pb-6 last:pb-0"
      >
        <div className="relative flex flex-col items-center">
          <span className={cn('z-10 flex size-8 items-center justify-center rounded-full border-2 bg-background', dot.ring)}>
            <span className={cn('flex size-6 items-center justify-center rounded-full', dot.bg)}>
              <FontAwesomeIcon icon={dot.icon} className="size-3" />
            </span>
          </span>
          {!last && <span className="absolute top-8 h-full w-px bg-border/60" />}
        </div>

        <div className="flex flex-1 items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.12)] hover:border-border/60 transition-all duration-300">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Locked</span>
            <h4 className="text-base font-bold text-foreground mt-0.5 truncate">{b.offeringTitle}</h4>
            <div className="mt-2.5 flex items-center gap-3 max-w-xs">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: '40%' }} />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">20 mins to start</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs font-semibold text-muted-foreground">00:00:46</span>
            <Button
              size="default"
              className="h-10 rounded-xl px-5 text-xs font-bold bg-destructive hover:bg-destructive/90 text-white"
            >
              Live
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // 4. Past / Completed sessions (Digital Marketing Strategy style)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative flex gap-4 pb-6 last:pb-0"
    >
      <div className="relative flex flex-col items-center">
        <span className={cn('z-10 flex size-8 items-center justify-center rounded-full border-2 bg-background', dot.ring)}>
          <span className={cn('flex size-6 items-center justify-center rounded-full', dot.bg)}>
            <FontAwesomeIcon icon={dot.icon} className="size-3" />
          </span>
        </span>
        {!last && <span className="absolute top-8 h-full w-px bg-border/60" />}
      </div>

      <div className="flex flex-1 items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.12)] hover:border-border/60 transition-all duration-300">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Past 1:1</span>
          <h4 className="text-base font-bold text-foreground mt-0.5 truncate">{b.offeringTitle}</h4>
          <div className="flex items-center gap-2 mt-2">
            <CreatorAvatar name={b.creatorName ?? 'A'} src={b.creatorPhotoUrl} size="sm" />
            <span className="text-xs text-muted-foreground font-semibold">
              Srikar &middot; summary
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 shrink-0 text-xs font-semibold"
        >
          Summary
        </Button>
      </div>
    </motion.div>
  )
}

export function LearningTimeline({ items }: { items: LearnerBookingItem[] }): React.ReactElement {
  const active = items.filter((b) => b.status === 'confirmed').length

  return (
    <div className="space-y-6">
      {/* Title */}
      <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">
        Learning Timeline
      </h3>

      {/* Progress Bar Summary Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            {active} Active Offers
            <span className="text-muted-foreground font-normal"> | {items.length ? Math.round((active / items.length) * 100) : 0}% Complete</span>
          </p>
          <Link href="/schedule" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline uppercase tracking-wide">
            View all &rarr;
          </Link>
        </div>
        <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all"
            style={{ width: `${items.length ? Math.round((active / items.length) * 100) : 0}%` }} />
        </div>
      </div>

      {/* Timeline items list */}
      <div className="space-y-1">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground shadow-sm">
            No activity yet — book a session or buy a product to start your timeline.
          </div>
        ) : (
          <div>
            {items.map((b, i) => (
              <TimelineRow key={b.id} b={b} last={i === items.length - 1} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
