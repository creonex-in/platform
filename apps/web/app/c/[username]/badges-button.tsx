'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCrown, faHeart, faUsers, faFire,
  faShieldHalved, faCircleCheck, faMicrophone, faStar,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const BADGES: { id: string; name: string; icon: IconDefinition }[] = [
  { id: '1', name: 'Top 1%',          icon: faCrown        },
  { id: '2', name: "People's Choice", icon: faHeart        },
  { id: '3', name: 'Community Care',  icon: faUsers        },
  { id: '4', name: 'Bestseller',      icon: faFire         },
  { id: '5', name: 'Elite Advisor',   icon: faShieldHalved },
  { id: '6', name: 'Trusted Pro',     icon: faCircleCheck  },
  { id: '7', name: 'Top Speaker',     icon: faMicrophone   },
  { id: '8', name: '5-Star Rated',    icon: faStar         },
]

const VISIBLE = 4

function BadgeTile({ name, icon, size = 'sm' }: {
  name: string
  icon: IconDefinition
  size?: 'sm' | 'lg'
}): React.ReactElement {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 text-zinc-750 dark:text-zinc-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)] transition-colors duration-200 cursor-default",
      size === 'sm' ? 'text-[11px] h-[26px]' : 'text-[12.5px] h-[32px] px-3.5 py-1.5'
    )}>
      <FontAwesomeIcon icon={icon} className={cn("text-zinc-400 dark:text-zinc-500 shrink-0", size === 'sm' ? 'size-3' : 'size-3.5')} />
      <span className="font-semibold tracking-tight whitespace-nowrap">{name}</span>
    </div>
  )
}

export function BadgesButton(): React.ReactElement {
  const [open, setOpen] = useState(false)
  const visible = BADGES.slice(0, VISIBLE)
  const remaining = BADGES.length - VISIBLE

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
            {BADGES.map((b) => (
              <BadgeTile key={b.id} name={b.name} icon={b.icon} size="lg" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

