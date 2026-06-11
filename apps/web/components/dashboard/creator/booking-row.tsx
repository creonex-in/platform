'use client'

import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faPhone, faCalendarDays, faUsers, faFileLines, faBullseye } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Booking, BookingStatus } from '@/types/booking'
import type { OfferType } from '@/types/offer'
import { formatCurrency, cn } from '@/lib/utils'

const offerTypeIcon: Record<OfferType, IconDefinition> = {
  '1:1': faPhone,
  workshop: faCalendarDays,
  group: faUsers,
  digital: faFileLines,
  community: faUsers,
  coaching_plan: faBullseye,
}

const statusVariant: Record<BookingStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  upcoming: 'default',
  confirmed: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
}

interface BookingRowProps {
  booking: Booking
  index?: number
  compact?: boolean
}

export function BookingRow({ booking, index = 0, compact = false }: BookingRowProps): React.ReactElement {
  const icon = offerTypeIcon[booking.offerType]

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
          {booking.learnerInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{booking.learnerName}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
          <FontAwesomeIcon icon={icon} className="size-3" />
          <span className="truncate">{booking.offerTitle}</span>
        </div>
      </div>
      {!compact && (
        <div className="text-right shrink-0">
          <p className="text-sm font-medium">{formatCurrency(booking.price)}</p>
          <p className="text-xs text-muted-foreground">{booking.date} · {booking.time}</p>
        </div>
      )}
      {compact && (
        <div className="shrink-0 text-xs text-muted-foreground flex items-center gap-1">
          <FontAwesomeIcon icon={faClock} className="size-3" />
          {booking.time}
        </div>
      )}
      <Badge variant={statusVariant[booking.status]} className="text-[10px] px-1.5 py-0 h-4 shrink-0 capitalize">
        {booking.status}
      </Badge>
    </motion.div>
  )
}
