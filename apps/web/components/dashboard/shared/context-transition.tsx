'use client'

import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

interface ContextTransitionProps {
  /** Controls visibility. Mounts/unmounts based on this flag. */
  isVisible: boolean
  /** The destination role context we are loading. */
  targetRole: 'learner' | 'creator'
}

/**
 * A professional, full-screen interstitial overlay used to visually separate
 * the Learner and Creator workspaces during navigation.
 */
export function ContextTransition({ isVisible, targetRole }: ContextTransitionProps): React.ReactElement | null {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background/98 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-8 animate-in slide-in-from-bottom-2 duration-500 ease-out">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.webp"
            alt="Creonex"
            width={48}
            height={48}
            className="size-12 object-contain dark:invert"
            priority
          />
          <span className="text-4xl font-bold tracking-tight">
            creo<span className="text-primary">nex</span>
          </span>
        </div>

        {/* Minimal Loading Status */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <FontAwesomeIcon icon={faCircleNotch} className="size-4 animate-spin text-primary" />
          <span className="text-sm font-medium uppercase tracking-widest">
            Loading {targetRole === 'creator' ? 'Creator OS' : 'Learner Hub'}...
          </span>
        </div>

      </div>
    </div>
  )
}
