'use client'

import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faUsers, faBolt } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { Creator } from '@/types/creator'
import { formatCurrency, formatFollowers, cn } from '@/lib/utils'
import { getCQSBadgeVariant, getCQSTier } from '@/lib/cqs'

interface CreatorCardProps {
  creator: Creator
  index?: number
}

export function CreatorCard({ creator, index = 0 }: CreatorCardProps): React.ReactElement {
  const tier = getCQSTier(creator.cqsScore)
  const badgeVariant = getCQSBadgeVariant(tier)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 6) * 0.04, ease: 'easeOut' }}
      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="size-11">
            <AvatarFallback className="bg-muted text-sm font-medium">
              {creator.initials}
            </AvatarFallback>
          </Avatar>
          {creator.isLive && (
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card bg-red-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{creator.name}</p>
          <p className="text-xs text-muted-foreground">{creator.niche}</p>
        </div>
        <Badge variant={badgeVariant} className="shrink-0 px-1.5 text-[10px]">
          CQS {creator.cqsScore}
        </Badge>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faStar} className="size-3 text-amber-400" />
          {creator.rating} ({creator.reviewCount})
        </span>
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faUsers} className="size-3" />
          {formatFollowers(creator.followers)}
        </span>
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faBolt} className="size-3" />
          {creator.totalBookings} sessions
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {creator.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div>
          <p className="text-sm font-semibold">{formatCurrency(creator.sessionPrice)}</p>
          <p className="text-[10px] text-muted-foreground">per session</p>
        </div>
        <Link
          href={`/creator/${creator.username}`}
          className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
        >
          Book now
        </Link>
      </div>
    </motion.div>
  )
}
