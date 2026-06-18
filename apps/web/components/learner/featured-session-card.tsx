'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo, faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { SessionDetailDrawer } from './session-detail-drawer'
import { formatWhen } from './shared'
import type { LearnerBookingItem } from '@creonex/types'
import { CreatorAvatar } from '../explore/session-card'
import { BrandedFallback } from './learner-card'

function getCountdownLabel(startTime: string | null): string {
  if (!startTime) return ''
  const diffMs = new Date(startTime).getTime() - Date.now()
  if (diffMs <= 0) return 'Starting now'
  const diffHrs = diffMs / 3600000
  if (diffHrs < 1) {
    const mins = Math.max(1, Math.round(diffMs / 60000))
    return `in ${mins}m`
  }
  if (diffHrs < 24) {
    return `in ${Math.round(diffHrs)}h`
  }
  const diffDays = Math.round(diffHrs / 24)
  if (diffDays === 1) return 'Tomorrow'
  return `in ${diffDays} days`
}

export function FeaturedSessionCard({
  booking,
}: {
  booking: LearnerBookingItem
}): React.ReactElement {
  const [openDetails, setOpenDetails] = useState(false)
  const [countdownText, setCountdownText] = useState('')

  useEffect(() => {
    setCountdownText(getCountdownLabel(booking.startTime))
    const t = setInterval(() => {
      setCountdownText(getCountdownLabel(booking.startTime))
    }, 60000)
    return () => clearInterval(t)
  }, [booking.startTime])

  const diffMs = booking.startTime ? new Date(booking.startTime).getTime() - Date.now() : 0
  // Can join if meetingUrl exists and is within 1 hour before start or after start
  const canJoin = !!booking.meetingUrl && (diffMs <= 3600000 && diffMs > -900000)

  const thumbSrc = booking.thumbnailUrl ?? booking.creatorPhotoUrl
  const isLiveEvent = booking.offeringType === 'live_event'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="text-2xl font-bold text-foreground">Your next session</h3>
        {countdownText && (
          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
            {countdownText}
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row rounded-2xl border border-border bg-card overflow-hidden shadow-[0_4px_24px_-4px_rgba(0,0,0,0.10)]">
        {/* Left: 40% width on desktop, aspect 16/9 */}
        <div className="relative w-full md:w-[40%] aspect-[16/9] shrink-0 overflow-hidden bg-muted">
          {thumbSrc ? (
            <img
              src={thumbSrc}
              alt={booking.offeringTitle}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <BrandedFallback
              niche={booking.offeringType === 'live_event' ? 'cat_mba_prep' : 'interview_prep'}
              creatorName={booking.creatorName}
              creatorPhotoUrl={booking.creatorPhotoUrl}
            />
          )}
        </div>

        {/* Right: Details */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              {booking.offeringType === 'live_event' ? 'Live Workshop' : '1:1 Session'}
            </span>

            <h2 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-foreground truncate">
              {booking.offeringTitle}
            </h2>

            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {booking.topic ? booking.topic : `Booked session with ${booking.creatorName}`}
            </p>

            {/* Creator name with avatar */}
            <div className="flex items-center gap-2 pt-1">
              <CreatorAvatar
                name={booking.creatorName ?? 'Creator'}
                src={booking.creatorPhotoUrl}
                size="sm"
              />
              <span className="text-sm font-medium text-foreground">
                {booking.creatorName}
              </span>
            </div>
          </div>

          {/* Footer: Date/time + CTA */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl w-fit">
              <FontAwesomeIcon icon={faCalendarDays} className="size-4 text-primary" />
              <span className="font-semibold">{formatWhen(booking.startTime)}</span>
            </div>

            <div>
              {canJoin ? (
                <Button
                  size="default"
                  className="h-11 rounded-xl px-6 font-semibold"
                  nativeButton={false}
                  render={<a href={booking.meetingUrl!} target="_blank" rel="noopener noreferrer" />}
                >
                  <FontAwesomeIcon icon={faVideo} className="size-3.5 mr-2" /> Join Now
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="default"
                  className="h-11 rounded-xl px-6 font-semibold border-primary text-primary hover:bg-primary/10"
                  onClick={() => setOpenDetails(true)}
                >
                  View details
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <SessionDetailDrawer
        booking={booking}
        open={openDetails}
        onClose={() => setOpenDetails(false)}
      />
    </div>
  )
}
