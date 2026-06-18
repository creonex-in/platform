'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarPlus, faVideo, faClock, faXmark, faUser, faPlus, faNoteSticky,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCancelBooking, useNotes, useNoteMutations } from '@/hooks/use-learner'
import { isApiError } from '@/lib/api'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { offerTypeMeta, StatusBadge, formatWhen, isUpcoming } from './shared'
import type { LearnerBookingItem } from '@creonex/types'

function gcalUrl(b: LearnerBookingItem): string {
  if (!b.startTime) return '#'
  const start = new Date(b.startTime)
  const defaultMin = b.offeringType === 'one_on_one' ? 60 : 90
  const end = b.endTime ? new Date(b.endTime) : new Date(start.getTime() + defaultMin * 60_000)
  const fmt = (d: Date) => d.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z'
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[Creonex] ${b.offeringTitle}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: [
      b.meetingUrl ? `Join: ${b.meetingUrl}` : '',
      b.creatorName ? `With: ${b.creatorName}` : '',
      'Booked on Creonex',
    ]
      .filter(Boolean)
      .join('\n'),
    location: b.meetingUrl ?? '',
  })
  return `https://calendar.google.com/calendar/render?${p}`
}

export function SessionDetailDrawer({
  booking,
  open,
  onClose,
}: {
  booking: LearnerBookingItem | null
  open: boolean
  onClose: () => void
}): React.ReactElement {
  const cancel = useCancelBooking()
  const { data: allNotes = [] } = useNotes()
  const { create } = useNoteMutations()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  const meta = booking ? offerTypeMeta(booking.offeringType) : null
  const bookingNotes = booking ? allNotes.filter((n) => n.bookingId === booking.id) : []
  const upcoming = booking
    ? isUpcoming(booking.startTime) && booking.status === 'confirmed'
    : false
  const canJoin = upcoming && !!booking?.meetingUrl
  const canCancel = booking
    ? upcoming || booking.status === 'pending_payment'
    : false

  async function doCancel(): Promise<void> {
    if (!booking) return
    try {
      await cancel.mutateAsync({ id: booking.id })
      toast.success('Booking cancelled')
      onClose()
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not cancel.')
    }
  }

  async function saveNote(): Promise<void> {
    if (!booking) return
    if (!noteTitle.trim()) { toast.error('Add a title'); return }
    try {
      await create.mutateAsync({ title: noteTitle.trim(), content: noteContent, bookingId: booking.id })
      setAddingNote(false)
      setNoteTitle('')
      setNoteContent('')
      toast.success('Note saved')
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not save note.')
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
          {/* Header */}
          <SheetHeader className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              {meta && booking && (
                <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted', meta.accent)}>
                  <FontAwesomeIcon icon={meta.icon} className="size-5" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-left text-base leading-snug">
                  {booking?.offeringTitle ?? ''}
                </SheetTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {booking && <StatusBadge status={booking.status} />}
                  {booking?.creatorName && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FontAwesomeIcon icon={faUser} className="size-2.5" />
                      {booking.creatorName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {/* Date/time */}
            {booking?.startTime && (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <FontAwesomeIcon icon={faClock} className="size-3.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{formatWhen(booking.startTime)}</p>
                  {booking.endTime && (
                    <p className="text-xs text-muted-foreground">Ends {formatWhen(booking.endTime)}</p>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {canJoin && booking && (
                <Button
                  size="sm"
                  className="h-9 rounded-lg"
                  nativeButton={false}
                  render={<a href={booking.meetingUrl!} target="_blank" rel="noopener noreferrer" />}
                >
                  <FontAwesomeIcon icon={faVideo} className="size-3.5 mr-1.5" />
                  Join meeting
                </Button>
              )}
              {booking?.startTime && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg"
                  nativeButton={false}
                  render={<a href={gcalUrl(booking)} target="_blank" rel="noopener noreferrer" />}
                >
                  <FontAwesomeIcon icon={faCalendarPlus} className="size-3.5 mr-1.5" />
                  Add to calendar
                </Button>
              )}
            </div>

            {/* Notes */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <FontAwesomeIcon icon={faNoteSticky} className="size-3.5 text-[var(--pastel-lavender)]" />
                  Session notes
                  {bookingNotes.length > 0 && (
                    <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                      ({bookingNotes.length})
                    </span>
                  )}
                </h4>
                {!addingNote && (
                  <button
                    type="button"
                    onClick={() => setAddingNote(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <FontAwesomeIcon icon={faPlus} className="size-2.5" />
                    Add
                  </button>
                )}
              </div>

              {/* Inline note form */}
              {addingNote && (
                <div className="mb-3 space-y-2 rounded-xl border border-primary/25 bg-primary/5 p-3">
                  <Input
                    placeholder="Title"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    maxLength={120}
                    className="h-9 text-sm"
                  />
                  <Textarea
                    placeholder="Write your note…"
                    rows={4}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    maxLength={10_000}
                    className="text-sm resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg"
                      onClick={() => { setAddingNote(false); setNoteTitle(''); setNoteContent('') }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 rounded-lg"
                      disabled={create.isPending}
                      onClick={saveNote}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {bookingNotes.length === 0 && !addingNote ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No notes for this session yet. Add one to capture your thoughts.
                </p>
              ) : (
                <div className="space-y-2">
                  {bookingNotes.map((n) => (
                    <div key={n.id} className="rounded-xl border border-border bg-card p-3">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      {n.content && (
                        <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">
                          {n.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cancel footer */}
          {canCancel && (
            <div className="border-t border-border px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-lg border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={() => setConfirmCancel(true)}
                disabled={cancel.isPending}
              >
                <FontAwesomeIcon icon={faXmark} className="size-3.5 mr-1.5" />
                Cancel booking
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{booking?.offeringTitle}</span> will be
              cancelled. If you paid, a refund is processed per the cancellation policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={doCancel}
            >
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
