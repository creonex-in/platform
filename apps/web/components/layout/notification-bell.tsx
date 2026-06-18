'use client'

import { useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import { learnerService } from '@/services/learner.service'
import type { LearnerBookingItem } from '@creonex/types'

function todayCount(bookings: LearnerBookingItem[]): number {
  const now = Date.now()
  const dayMs = 86_400_000
  return bookings.filter(
    (b) =>
      b.status === 'confirmed' &&
      b.offeringType !== 'digital' &&
      b.startTime !== null &&
      new Date(b.startTime).getTime() - now > -900_000 && // not more than 15min past
      new Date(b.startTime).getTime() - now < dayMs,
  ).length
}

export function NotificationBell(): React.ReactElement {
  const { data: bookings = [] } = useQuery({
    queryKey: ['learner', 'bookings'],
    queryFn: () => learnerService.getMyBookings(),
    staleTime: 60_000,
  })

  const count = todayCount(bookings)

  return (
    <button
      type="button"
      aria-label={count > 0 ? `${count} session${count > 1 ? 's' : ''} today` : 'Notifications'}
      className="relative flex size-9 items-center justify-center rounded-full border border-border bg-muted/50 text-foreground transition-colors hover:bg-muted"
    >
      <FontAwesomeIcon icon={faBell} className="size-[15px]" />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
