'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faClock, faUsers } from '@fortawesome/free-solid-svg-icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Offer } from '@/types/offer'
import type { Creator } from '@/types/creator'
import { formatCurrency } from '@/lib/utils'

interface WorkshopCardProps {
  offer: Offer
  creator?: Creator
  index?: number
}

export function WorkshopCard({ offer, creator, index = 0 }: WorkshopCardProps): React.ReactElement {
  const seatsPercent = offer.seats ? ((offer.seats - (offer.seatsLeft ?? 0)) / offer.seats) * 100 : 0
  const isFull = offer.seatsLeft === 0
  const isAlmostFull = (offer.seatsLeft ?? Infinity) <= 5

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 6) * 0.04 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {offer.image && (
        <div className="relative aspect-[16/9] w-full bg-muted">
          <Image
            src={offer.image}
            alt={offer.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
          <Badge
            variant="secondary"
            className="absolute left-2 top-2 bg-background/90 px-2 text-[10px] font-medium capitalize backdrop-blur"
          >
            {offer.type}
          </Badge>
          {isAlmostFull && !isFull && (
            <Badge variant="destructive" className="absolute right-2 top-2 h-5 px-2 text-[10px]">
              Almost full
            </Badge>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{offer.title}</p>
          {creator && (
            <div className="flex items-center gap-1.5 mt-1">
              <Avatar className="size-5">
                <AvatarFallback className="bg-muted text-[9px] font-medium">
                  {creator.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{creator.name}</span>
            </div>
          )}
        </div>
        {!offer.image && isAlmostFull && !isFull && (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
            Almost full
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {offer.date && (
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faCalendarDays} className="size-3" />
            {offer.date}
          </span>
        )}
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faClock} className="size-3" />
          {offer.duration} min
        </span>
        {offer.seats && (
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faUsers} className="size-3" />
            {offer.seatsLeft} left
          </span>
        )}
      </div>

      {offer.seats && (
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${seatsPercent}%` }}
          />
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <p className="text-sm font-semibold">{formatCurrency(offer.price)}</p>
        <Button size="sm" disabled={isFull}>
          {isFull ? 'Full' : 'Register'}
        </Button>
      </div>
      </div>
    </motion.div>
  )
}
