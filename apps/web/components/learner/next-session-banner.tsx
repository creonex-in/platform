'use client'

import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faVideo } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import type { LearnerBookingItem } from '@creonex/types'

function countdown(ms: number): string {
  if (ms <= 0) return 'Starting now'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export function NextSessionBanner({
  session,
}: {
  session: LearnerBookingItem | null
}): React.ReactElement | null {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!session?.startTime) return
    const update = () =>
      setRemaining(new Date(session.startTime!).getTime() - Date.now())
    update()
    const t = setInterval(update, 60_000)
    return () => clearInterval(t)
  }, [session?.startTime])

  if (!session || remaining === null) return null
  // Only show if within 24 hours and not more than 15 minutes past start
  if (remaining > 86_400_000 || remaining < -900_000) return null

  return (
    <div className="mb-5 flex items-center gap-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <FontAwesomeIcon icon={faClock} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{session.offeringTitle}</p>
        <p className="text-xs text-muted-foreground">
          {remaining <= 0 ? 'Starting now' : `Starts in ${countdown(remaining)}`}
          {session.creatorName ? ` · ${session.creatorName}` : ''}
        </p>
      </div>
      {session.meetingUrl && (
        <Button
          size="sm"
          className="h-9 shrink-0 rounded-lg"
          nativeButton={false}
          render={<a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" />}
        >
          <FontAwesomeIcon icon={faVideo} className="size-3.5 mr-1.5" /> Join
        </Button>
      )}
    </div>
  )
}
