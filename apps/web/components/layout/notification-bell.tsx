'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'
import { learnerService } from '@/services/learner.service'
import { formatWhen } from '@/components/learner/shared'
import type { LearnerBookingItem } from '@creonex/types'

function relativeTime(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= -900_000) return 'Ended'
  if (ms <= 0) return 'Now'
  const h = Math.floor(ms / 3_600_000)
  const d = Math.floor(h / 24)
  if (d > 0) return `in ${d}d`
  if (h > 0) return `in ${h}h`
  const m = Math.floor(ms / 60_000)
  return `in ${m < 1 ? 1 : m}m`
}

function getNotifications(bookings: LearnerBookingItem[]): LearnerBookingItem[] {
  const now = Date.now()
  return bookings
    .filter(
      (b) =>
        b.status === 'confirmed' &&
        b.offeringType !== 'digital' &&
        b.startTime !== null &&
        new Date(b.startTime).getTime() > now - 900_000 &&
        new Date(b.startTime).getTime() < now + 7 * 86_400_000,
    )
    .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime())
    .slice(0, 8)
}

export function NotificationBell(): React.ReactElement {
  const [open, setOpen] = useState(false)
  const { data: bookings = [] } = useQuery({
    queryKey: ['learner', 'bookings'],
    queryFn: () => learnerService.getMyBookings(),
    staleTime: 60_000,
  })

  const notifications = getNotifications(bookings)
  const count = notifications.filter(
    (b) => new Date(b.startTime!).getTime() - Date.now() < 86_400_000,
  ).length

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={count > 0 ? `${count} session${count > 1 ? 's' : ''} today` : 'Notifications'}
        className="relative flex size-9 items-center justify-center rounded-full border border-border bg-muted/50 text-foreground transition-colors hover:bg-muted"
      >
        <FontAwesomeIcon icon={faBell} className="size-[15px]" />
        {count > 0 && (
          <span className="absolute right-0.5 top-0.5 flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="animate-in fade-in-0 zoom-in-95 absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18)] duration-100">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <p className="text-sm font-bold text-foreground">Notifications</p>
              {notifications.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  {notifications.length} upcoming
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                  <FontAwesomeIcon icon={faBell} className="size-5 text-muted-foreground/50" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">No notifications</p>
                  <p className="mt-1 text-xs text-muted-foreground">Upcoming sessions will appear here.</p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((b) => {
                  const soonMs = new Date(b.startTime!).getTime() - Date.now()
                  const isUrgent = soonMs < 3_600_000
                  return (
                    <li key={b.id} className="flex items-start gap-3 px-4 py-3.5">
                      <span className={cn(
                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl',
                        isUrgent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                      )}>
                        <FontAwesomeIcon icon={faCalendarDays} className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{b.offeringTitle}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {b.creatorName ? `with ${b.creatorName} · ` : ''}{formatWhen(b.startTime)}
                        </p>
                      </div>
                      <span className={cn(
                        'shrink-0 text-[11px] font-bold',
                        isUrgent ? 'text-destructive' : 'text-muted-foreground',
                      )}>
                        {relativeTime(b.startTime!)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
