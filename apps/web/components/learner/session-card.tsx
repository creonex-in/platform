'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo, faXmark, faClock } from '@fortawesome/free-solid-svg-icons'
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

export function SessionCard({ booking, onChanged }: { booking: LearnerBookingItem; onChanged?: () => void }): React.ReactElement {
  const meta = offerTypeMeta(booking.offeringType)
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
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs hover:border-primary/25">
      <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted', meta.accent)}>
        <FontAwesomeIcon icon={meta.icon} className="size-5" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{booking.offeringTitle}</p>
          <StatusBadge status={booking.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
          <span>{meta.label}</span>
          {booking.creatorName && (<><span>·</span><span>{booking.creatorName}</span></>)}
          {booking.offeringType !== 'digital' && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1"><FontAwesomeIcon icon={faClock} className="size-3" />{formatWhen(booking.startTime)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {canJoin && (
          <Button
            size="sm"
            className="h-9 rounded-lg"
            nativeButton={false}
            render={<a href={booking.meetingUrl!} target="_blank" rel="noopener noreferrer" />}
          >
            <FontAwesomeIcon icon={faVideo} className="size-3.5 mr-1.5" /> Join
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline" size="sm"
            className="h-9 rounded-lg text-muted-foreground hover:text-destructive"
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
              <span className="font-medium text-foreground">{booking.offeringTitle}</span> will be cancelled. If you
              paid, a refund is processed per the cancellation policy.
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
