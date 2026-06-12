'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCrown, faHeart, faUsers, faFire,
  faCircleCheck, faStar,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { PublicCreatorProfile } from '@creonex/types'

interface Badge { id: string; name: string; icon: IconDefinition }

function getBadges(profile: PublicCreatorProfile): Badge[] {
  const badges: Badge[] = []
  const tier = profile.qualityTier
  const rating = parseFloat(profile.smoothedRating)

  if (tier === 'platinum') badges.push({ id: 'top1', name: 'Top 1%', icon: faCrown })
  if (tier === 'gold') badges.push({ id: 'toprated', name: 'Top Rated', icon: faStar })
  if (tier === 'silver') badges.push({ id: 'community', name: 'Community Pick', icon: faHeart })
  if (tier === 'bronze') badges.push({ id: 'rising', name: 'Rising Star', icon: faFire })
  if (profile.isVerified) badges.push({ id: 'trusted', name: 'Trusted Pro', icon: faCircleCheck })
  if (rating >= 4.9 && profile.totalReviews > 0) badges.push({ id: '5star', name: '5-Star Rated', icon: faStar })
  if (profile.totalSessions >= 100) badges.push({ id: '100sessions', name: '100+ Sessions', icon: faUsers })
  else if (profile.totalSessions >= 50) badges.push({ id: '50sessions', name: '50+ Sessions', icon: faUsers })

  return badges
}

const VISIBLE = 4

function BadgeTile({ name, icon, size = 'sm' }: {
  name: string
  icon: IconDefinition
  size?: 'sm' | 'lg'
}): React.ReactElement {
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 text-zinc-750 dark:text-zinc-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)] transition-colors duration-200 cursor-default',
      size === 'sm' ? 'text-[11px] h-[26px]' : 'text-[12.5px] h-[32px] px-3.5 py-1.5',
    )}>
      <FontAwesomeIcon icon={icon} className={cn('text-zinc-400 dark:text-zinc-500 shrink-0', size === 'sm' ? 'size-3' : 'size-3.5')} />
      <span className="font-semibold tracking-tight whitespace-nowrap">{name}</span>
    </div>
  )
}

export function BadgesButton({ profile }: { profile: PublicCreatorProfile }): React.ReactElement {
  const [open, setOpen] = useState(false)
  const badges = getBadges(profile)
  const visible = badges.slice(0, VISIBLE)
  const remaining = badges.length - VISIBLE

  if (badges.length === 0) return <></>

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {visible.map((b) => (
          <BadgeTile key={b.id} name={b.name} icon={b.icon} />
        ))}
        {remaining > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center h-[26px] px-3 rounded-full border border-zinc-200/75 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 active:scale-95 transition-all text-[11px] font-bold text-zinc-500 dark:text-zinc-400 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
          >
            +{remaining} more
          </button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">All Creator Badges</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 py-4 justify-start">
            {badges.map((b) => (
              <BadgeTile key={b.id} name={b.name} icon={b.icon} size="lg" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
