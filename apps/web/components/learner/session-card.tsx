'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo, faXmark, faClock, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCancelBooking } from '@/hooks/use-learner'
import { isApiError } from '@/lib/api'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { offerTypeMeta, StatusBadge, formatWhen, isUpcoming } from './shared'
import type { LearnerBookingItem } from '@creonex/types'

function BookingImage({ booking }: { booking: LearnerBookingItem }): React.ReactElement {
  const meta = offerTypeMeta(booking.offeringType)
  const thumb = booking.thumbnailUrl
  const avatar = booking.creatorPhotoUrl

  if (thumb) {
    return (
      <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-muted">
        <Image src={thumb} alt="" fill className="object-cover" sizes="56px" />
      </span>
    )
  }
  if (avatar) {
    return (
      <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
        <Image src={avatar} alt="" fill className="object-cover" sizes="48px" />
      </span>
    )
  }
  return (
    <span className={cn('flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted', meta.accent)}>
      <FontAwesomeIcon icon={meta.icon} className="size-5" />
    </span>
  )
}

export function SessionCard({
  booking,
  onChanged,
  onDetails,
}: {
  booking: LearnerBookingItem
  onChanged?: () => void
  onDetails?: () => void
}): React.ReactElement {
  const cancel = useCancelBooking()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const upcoming = isUpcoming(booking.startTime) && booking.status === 'confirmed'
  const canJoin = upcoming && !!booking.meetingUrl
  const canCancel = upcoming || booking.status === 'pending_payment'

  async function doCancel(): Promise<void> {
    try {
      await cancel.mutateAsync({ id: booking.id })
      toast.success('Booking cancelled')
      onChanged?.()
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not cancel. Try again.')
    }
  }

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.12)]">
      <BookingImage booking={booking} />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-base font-semibold text-foreground">{booking.offeringTitle}</p>
          <StatusBadge status={booking.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
          {booking.creatorName && <span>{booking.creatorName}</span>}
          {booking.offeringType !== 'digital' && booking.startTime && (
            <>
              {booking.creatorName && <span className="text-border">·</span>}
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faClock} className="size-3 shrink-0" />
                {formatWhen(booking.startTime)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {canJoin && (
          <Button
            size="default"
            className="h-10 rounded-xl"
            nativeButton={false}
            render={<a href={booking.meetingUrl!} target="_blank" rel="noopener noreferrer" />}
          >
            <FontAwesomeIcon icon={faVideo} className="size-3.5 mr-1.5" />
            Join
          </Button>
        )}
        {onDetails && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60"
            onClick={onDetails}
            aria-label="Session details"
          >
            <FontAwesomeIcon icon={faChevronRight} className="size-3.5" />
          </Button>
        )}
        {canCancel && !onDetails && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-primary/30 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/60"
            onClick={() => setConfirmOpen(true)}
            aria-label="Cancel booking"
          >
            <FontAwesomeIcon icon={faXmark} className="size-3.5" />
          </Button>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{booking.offeringTitle}</span> will be
              cancelled. If you paid, a refund is processed per the cancellation policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={doCancel}>
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
