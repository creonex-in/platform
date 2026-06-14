'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faCalendarDays,
  faUsers,
  faFileLines,
  faPen,
  faEye,
  faEyeSlash,
  faBoxArchive,
  faEllipsis,
  faSpinner,
  faCopy,
  faIndianRupeeSign,
  faTrash,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { offeringsService } from '@/services/offerings.service'
import { isApiError } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/lib/toast'
import type { CreatorOffering, OfferStatus } from '@creonex/types'
import { cn } from '@/lib/utils'

interface OfferTypeConfig {
  icon: IconDefinition
  label: string
}

const offerTypeConfig: Record<string, OfferTypeConfig> = {
  one_on_one: { icon: faPhone, label: '1:1 Session' },
  workshop: { icon: faCalendarDays, label: 'Workshop' },
  group: { icon: faUsers, label: 'Group Call' },
  digital: { icon: faFileLines, label: 'Digital Product' },
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  live: { label: 'Live', variant: 'default' },
  draft: { label: 'Draft', variant: 'outline' },
  paused: { label: 'Paused', variant: 'secondary' },
  archived: { label: 'Archived', variant: 'outline' },
}

interface OfferItemProps {
  offer: CreatorOffering
  index?: number
  username: string
  /** Called after a successful status mutation so the list can refresh. */
  onChanged?: () => void
}

export function OfferItem({ offer, index = 0, username, onChanged }: OfferItemProps): React.ReactElement {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const typeConf = offerTypeConfig[offer.type] ?? { icon: faFileLines, label: offer.type }
  const statusConf = statusConfig[offer.status] ?? { label: offer.status, variant: 'outline' as const }

  const isArchived = offer.status === 'archived'
  // draft/paused → publish (live); live → pause
  const canPublish = offer.status === 'draft' || offer.status === 'paused'
  const canPause = offer.status === 'live'
  // Hard delete is only safe for an untouched draft (mirrors the server guard).
  const canDelete = offer.status === 'draft' && offer.totalBookings === 0

  // Which destructive confirmation dialog is open (null = none).
  const [confirm, setConfirm] = useState<'archive' | 'delete' | null>(null)

  async function transition(next: OfferStatus, verb: string): Promise<void> {
    setBusy(true)
    try {
      await offeringsService.transitionStatus(offer.id, next)
      toast.success(`Offer ${verb}.`)
      onChanged?.()
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function doDelete(): Promise<void> {
    setBusy(true)
    try {
      await offeringsService.deleteOffering(offer.id)
      toast.success('Draft deleted.')
      onChanged?.()
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not delete this offer. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleCopyLink = async (): Promise<void> => {
    if (offer.status === 'draft') {
      toast.error('Cannot share draft', 'Please publish this offering first.')
      return
    }
    if (offer.status === 'archived') {
      toast.error('Offer is archived', 'Archived offerings cannot receive bookings.')
      return
    }
    try {
      const url = `${window.location.origin}/c/${username}#offerings`
      await navigator.clipboard.writeText(url)
      toast.success('Booking link copied!', 'Share this link to start getting bookings.')
    } catch (e) {
      toast.error('Could not copy link.')
    }
  }

  // Calculate earnings in whole rupees
  const earningsRupees = offer.totalRevenuePaise / 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 4) * 0.03 }}
      className={cn(
        'relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:border-border/80 border-l-4 border-l-primary/60 hover:border-l-primary',
      )}
    >
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Left Side: Type Icon */}
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary shadow-xs">
          <FontAwesomeIcon icon={typeConf.icon} className="size-5.5" />
        </div>

        {/* Middle: Details & Stats */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4 className="text-sm md:text-base font-semibold truncate text-foreground leading-tight">{offer.title}</h4>
            <Badge
              variant={statusConf.variant}
              className={cn(
                'text-xs px-2 py-0.5 h-5 rounded-full flex items-center font-medium tracking-wide border-none',
                offer.status === 'live' && 'bg-primary/10 text-primary hover:bg-primary/15',
                offer.status === 'paused' && 'bg-muted text-muted-foreground hover:bg-muted/80',
                offer.status === 'draft' && 'bg-muted/50 text-muted-foreground/70',
              )}
            >
              {offer.status === 'live' && (
                <span className="relative flex h-1.5 w-1.5 mr-1 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                </span>
              )}
              {statusConf.label}
            </Badge>
          </div>

          {/* Stats Badges Ribbon */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs md:text-sm text-muted-foreground">
            {/* Price tag */}
            <span className="font-semibold text-foreground">
              {formatCurrency(offer.price)}
            </span>

            <span className="text-muted-foreground/40 font-light">•</span>

            {/* Bookings count */}
            <span className="flex items-center gap-1">
              <span className="font-medium text-foreground/80">{offer.totalBookings}</span> bookings
            </span>

            <span className="text-muted-foreground/40 font-light">•</span>

            {/* Total Revenue generated */}
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faIndianRupeeSign} className="size-3 text-primary/70" />
              <span className="font-semibold text-primary">
                {earningsRupees.toLocaleString('en-IN')}
              </span>
              <span>earned</span>
            </span>

            {offer.durationMinutes ? (
              <>
                <span className="text-muted-foreground/40 font-light">•</span>
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCalendarDays} className="size-3.5 text-muted-foreground/70" />
                  <span>{offer.durationMinutes} min</span>
                </span>
              </>
            ) : null}

            {offer.seatsRemaining !== null && (
              <>
                <span className="text-muted-foreground/40 font-light">•</span>
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faUsers} className="size-3.5 text-muted-foreground/70" />
                  <span>{offer.seatsRemaining} seats left</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Quick Action Buttons & Dropdown Menu */}
      <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3.5 sm:border-t-0 sm:pt-0 shrink-0">
        {offer.status === 'live' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-9 rounded-lg text-xs md:text-sm font-medium px-3 hidden.5 sm:flex hover:bg-muted/50 border-border/60"
            title="Copy Public Link"
          >
            <FontAwesomeIcon icon={faCopy} className="size-3.5 mr-1.5 text-muted-foreground" />
            Share Link
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={busy}
            render={<Button variant="ghost" size="icon" className="size-9 rounded-lg border border-border/50 shrink-0 hover:bg-muted/50" />}
          >
            <FontAwesomeIcon icon={busy ? faSpinner : faEllipsis} className={`size-4.5 ${busy ? 'animate-spin' : ''}`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-md border-border/80">
            <DropdownMenuItem disabled={isArchived} onClick={() => router.push(`/offers/${offer.id}/edit`)} className="rounded-lg py-2.5 text-sm font-normal">
              <FontAwesomeIcon icon={faPen} className="size-3.5 mr-2.5 text-muted-foreground" />
              Edit details
            </DropdownMenuItem>

            {offer.status !== 'draft' && offer.status !== 'archived' && (
              <DropdownMenuItem onClick={handleCopyLink} className="rounded-lg py-2.5 text-sm font-normal">
                <FontAwesomeIcon icon={faCopy} className="size-3.5 mr-2.5 text-muted-foreground" />
                Copy sharing link
              </DropdownMenuItem>
            )}

            {canPublish && (
              <DropdownMenuItem onClick={() => transition('live', 'published')} className="rounded-lg py-2.5 text-sm text-primary font-medium">
                <FontAwesomeIcon icon={faEye} className="size-3.5 mr-2.5" />
                {offer.status === 'paused' ? 'Resume public' : 'Publish live'}
              </DropdownMenuItem>
            )}
            {canPause && (
              <DropdownMenuItem onClick={() => transition('paused', 'paused')} className="rounded-lg py-2.5 text-sm text-muted-foreground font-normal">
                <FontAwesomeIcon icon={faEyeSlash} className="size-3.5 mr-2.5" />
                Pause bookings
              </DropdownMenuItem>
            )}

            {isArchived && (
              <DropdownMenuItem
                onClick={() => transition('draft', 'restored to draft')}
                className="rounded-lg py-2.5 text-sm font-medium text-primary focus:bg-primary/10"
              >
                <FontAwesomeIcon icon={faRotateLeft} className="size-3.5 mr-2.5" />
                Restore draft
              </DropdownMenuItem>
            )}

            {!isArchived && (
              <>
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuItem
                  className="rounded-lg py-2.5 text-sm font-normal text-amber-600 dark:text-amber-500 focus:bg-amber-500/10 focus:!text-amber-700 focus:**:!text-amber-700 dark:focus:!text-amber-400 dark:focus:**:!text-amber-400"
                  onClick={() => setConfirm('archive')}
                >
                  <FontAwesomeIcon icon={faBoxArchive} className="size-3.5 mr-2.5" />
                  Archive offer
                </DropdownMenuItem>
              </>
            )}

            {canDelete && (
              <DropdownMenuItem
                variant="destructive"
                className="rounded-lg py-2.5 text-sm font-normal"
                onClick={() => setConfirm('delete')}
              >
                <FontAwesomeIcon icon={faTrash} className="size-3.5 mr-2.5" />
                Delete draft
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Destructive-action confirmation (archive = reversible-ish/terminal hide; delete = permanent) */}
      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          {confirm === 'delete' ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="font-medium text-foreground">{offer.title}</span> will be permanently
                  removed. This can&apos;t be undone. Only unpublished drafts with no bookings can be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={cn('bg-destructive text-white hover:bg-destructive/90')}
                  onClick={doDelete}
                >
                  <FontAwesomeIcon icon={faTrash} className="size-3.5 mr-1.5" />
                  Delete permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive this offer?</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="font-medium text-foreground">{offer.title}</span> will be hidden from your
                  public page and stop taking new bookings. Existing bookings and history are kept, and you can
                  restore it later as a draft.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep active</AlertDialogCancel>
                <AlertDialogAction
                  className={cn('bg-amber-600 text-white hover:bg-amber-700')}
                  onClick={() => transition('archived', 'archived')}
                >
                  <FontAwesomeIcon icon={faBoxArchive} className="size-3.5 mr-1.5" />
                  Archive offer
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
