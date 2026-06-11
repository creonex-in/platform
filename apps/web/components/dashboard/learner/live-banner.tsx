'use client'

import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faVideo } from '@fortawesome/free-solid-svg-icons'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Creator } from '@/types/creator'
import Link from 'next/link'

interface LiveBannerProps {
  creator: Creator
}

export function LiveBanner({ creator }: LiveBannerProps): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm"
    >
      <div className="flex shrink-0 items-center gap-2">
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="inline-flex"
        >
          <FontAwesomeIcon icon={faCircle} className="size-2 text-red-500" />
        </motion.span>
        <FontAwesomeIcon icon={faVideo} className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {creator.name} <span className="text-muted-foreground">is live now</span>
        </p>
        <p className="truncate text-xs text-muted-foreground">{creator.niche}</p>
      </div>
      <Link
        href={`/creator/${creator.username}`}
        className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'shrink-0')}
      >
        Join
      </Link>
    </motion.div>
  )
}
