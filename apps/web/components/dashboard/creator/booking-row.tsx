'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock, faPhone, faCalendarDays, faUsers,
  faFileLines, faBullseye, faXmark,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { CreatorBookingItem, CreatorBookingStatus } from '@creonex/types'
import type { OfferDisplayType } from '@/types/offer'
import { formatCurrency, getInitials, cn } from '@/lib/utils'
import { bookingsService } from '@/services/bookings.service'

const offerTypeIcon: Record<OfferDisplayType, IconDefinition> = {
  one_on_one: faPhone,
  workshop: faCalendarDays,
  group: faUsers,
  digital: faFileLines,
  community: faUsers,
  coaching_plan: faBullseye,
}

const statusVariant: Record<CreatorBookingStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending_payment: 'default',
  confirmed: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
}

const statusLabel: Record<CreatorBookingStatus, string> = {
  pending_payment: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function formatDateTime(startTime: string | null): { date: string; time: string } {
  if (!startTime) return { date: '—', time: '—' }
  const d = new Date(startTime)
  const isToday = d.toDateString() === new Date().toDateString()
  return {
    date: isToday
      ? 'Today'
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
  }
}

interface BookingRowProps {
  booking: CreatorBookingItem
  index?: number
  compact?: boolean
}

export function BookingRow({ booking, index = 0, compact = false }: BookingRowProps): React.ReactElement {
  const router = useRouter()
  const [cancelling, setCancelling] = useState(false)
  const icon = offerTypeIcon[booking.offeringType as OfferDisplayType] ?? faCalendarDays
  const { date, time } = formatDateTime(booking.startTime)

  async function handleCancel() {
    setCancelling(true)
    try {
      await bookingsService.cancelBooking(booking.id)
      router.refresh()
    } finally {
      setCancelling(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-card hover:bg-accent/20 transition-colors',
        compact ? 'p-2.5' : 'p-4'
      )}
    >
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-muted text-xs font-medium">
          {getInitials(booking.learnerName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{booking.learnerName}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
          <FontAwesomeIcon icon={icon} className="size-3" />
          <span className="truncate">{booking.offeringTitle}</span>
        </div>
      </div>
      {!compact && (
        <div className="text-right shrink-0">
          <p className="text-sm font-medium">{formatCurrency(booking.amountPaise / 100)}</p>
          <p className="text-xs text-muted-foreground">{date} · {time}</p>
        </div>
      )}
      {compact && (
        <div className="shrink-0 text-xs text-muted-foreground flex items-center gap-1">
          <FontAwesomeIcon icon={faClock} className="size-3" />
          {time}
        </div>
      )}
      <Badge
        variant={statusVariant[booking.status]}
        className="text-[10px] px-1.5 py-0 h-4 shrink-0 capitalize"
      >
        {statusLabel[booking.status]}
      </Badge>
      {booking.status === 'confirmed' && !compact && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
          disabled={cancelling}
          onClick={handleCancel}
        >
          <FontAwesomeIcon icon={faXmark} className="size-3" />
        </Button>
      )}
    </motion.div>
  )
}
