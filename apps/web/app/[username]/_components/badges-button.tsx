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

const BADGES: { id: string; name: string; icon: IconDefinition; gradient: string }[] = [
  { id: '1', name: 'Top 1%',          icon: faCrown,        gradient: 'from-amber-400 to-orange-500'  },
  { id: '2', name: "People's Choice", icon: faHeart,        gradient: 'from-pink-400 to-rose-500'     },
  { id: '3', name: 'Community Care',  icon: faUsers,        gradient: 'from-blue-400 to-indigo-500'   },
  { id: '4', name: 'Bestseller',      icon: faFire,         gradient: 'from-orange-400 to-red-500'    },
  { id: '5', name: 'Elite Advisor',   icon: faShieldHalved, gradient: 'from-emerald-400 to-teal-500'  },
  { id: '6', name: 'Trusted Pro',     icon: faCircleCheck,  gradient: 'from-cyan-400 to-blue-500'     },
  { id: '7', name: 'Top Speaker',     icon: faMicrophone,   gradient: 'from-violet-400 to-purple-600' },
  { id: '8', name: '5-Star Rated',    icon: faStar,         gradient: 'from-yellow-400 to-amber-500'  },
]

const VISIBLE = 4

function BadgeTile({ name, icon, gradient, size = 'sm' }: {
  name: string
  icon: IconDefinition
  gradient: string
  size?: 'sm' | 'lg'
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        'rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br shrink-0',
        size === 'sm' ? 'w-12 h-12' : 'w-16 h-16',
        gradient,
      )}>
        <FontAwesomeIcon icon={icon} className={cn('text-white', size === 'sm' ? 'size-[18px]' : 'size-6')} />
      </div>
      <span className={cn(
        'font-semibold text-muted-foreground text-center leading-tight truncate',
        size === 'sm' ? 'text-[8.5px] w-12' : 'text-[10px] w-16',
      )}>
        {name}
      </span>
    </div>
  )
}

export function BadgesButton(): React.ReactElement {
  const [open, setOpen] = useState(false)
  const visible = BADGES.slice(0, VISIBLE)
  const remaining = BADGES.length - VISIBLE

  return (
    <>
      <div className="flex items-end gap-2">
        {visible.map((b) => (
          <BadgeTile key={b.id} name={b.name} icon={b.icon} gradient={b.gradient} />
        ))}
        {remaining > 0 && (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setOpen(true)}
              className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80 active:scale-95 transition-all flex items-center justify-center text-[12px] font-bold text-muted-foreground shrink-0"
            >
              +{remaining}
            </button>
            <span className="text-[8.5px] text-muted-foreground font-semibold">more</span>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Badges</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-2">
            {BADGES.map((b) => (
              <BadgeTile key={b.id} name={b.name} icon={b.icon} gradient={b.gradient} size="lg" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
