'use client'

import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faCalendarDays,
  faUsers,
  faFileLines,
  faBullseye,
  faPen,
  faEye,
  faEyeSlash,
  faTrash,
  faEllipsis,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Offer, OfferDisplayType, OfferStatus } from '@/types/offer'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

const offerTypeConfig: Record<OfferDisplayType, { icon: IconDefinition; label: string }> = {
  one_on_one: { icon: faPhone, label: '1:1 Call' },
  workshop: { icon: faCalendarDays, label: 'Workshop' },
  group: { icon: faUsers, label: 'Group' },
  digital: { icon: faFileLines, label: 'Digital' },
  community: { icon: faUsers, label: 'Community' },
  coaching_plan: { icon: faBullseye, label: 'Coaching Plan' },
}

const statusConfig: Record<OfferStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  live: { label: 'Live', variant: 'default' },
  draft: { label: 'Draft', variant: 'outline' },
  paused: { label: 'Paused', variant: 'secondary' },
  archived: { label: 'Archived', variant: 'outline' },
  scheduled: { label: 'Scheduled', variant: 'secondary' },
  ended: { label: 'Ended', variant: 'outline' },
}

interface OfferItemProps {
  offer: Offer
  index?: number
}

export function OfferItem({ offer, index = 0 }: OfferItemProps): React.ReactElement {
  const typeConf = offerTypeConfig[offer.type]
  const statusConf = statusConfig[offer.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 6) * 0.04 }}
      className="flex items-center gap-3 sm:gap-4 rounded-lg border border-border bg-card p-3 sm:p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <FontAwesomeIcon icon={typeConf.icon} className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">{offer.title}</p>
          <Badge variant={statusConf.variant} className="text-[10px] px-1.5 py-0 h-4">
            {statusConf.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
          <span>{formatCurrency(offer.price)}</span>
          <span>·</span>
          <span>{offer.bookings} bookings</span>
          {offer.rating > 0 && (
            <>
              <span>·</span>
              <span><span className="text-amber-400">★</span> {offer.rating}</span>
            </>
          )}
          {offer.seatsLeft !== undefined && (
            <>
              <span>·</span>
              <span>{offer.seatsLeft} seats left</span>
            </>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <FontAwesomeIcon icon={faEllipsis} className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>
            <FontAwesomeIcon icon={faPen} className="size-3.5 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              toast.success(`Offer ${offer.status === 'live' ? 'unpublished' : 'published'}.`)
            }
          >
            <FontAwesomeIcon
              icon={offer.status === 'live' ? faEyeSlash : faEye}
              className="size-3.5 mr-2"
            />
            {offer.status === 'live' ? 'Unpublish' : 'Publish'}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <FontAwesomeIcon icon={faTrash} className="size-3.5 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
