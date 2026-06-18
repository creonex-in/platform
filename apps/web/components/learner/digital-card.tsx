'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { learnerService } from '@/services/learner.service'
import { isApiError } from '@/lib/api'
import { toast } from '@/lib/toast'
import { Spinner } from './shared'
import type { LearnerBookingItem } from '@creonex/types'

export function DigitalCard({ booking }: { booking: LearnerBookingItem }): React.ReactElement {
  const [loading, setLoading] = useState(false)

  async function download(): Promise<void> {
    setLoading(true)
    try {
      const access = await learnerService.getDigitalAccess(booking.id)
      const target = access.externalUrl ?? access.files?.[0]?.url ?? null
      if (!target) {
        toast.error('No download available yet', access.instructions ?? undefined)
        return
      }
      window.open(target, '_blank', 'noopener,noreferrer')
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not get the download. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const paid = booking.status === 'confirmed' || booking.status === 'completed'

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs hover:border-primary/25">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-[var(--pastel-sage)]">
        <FontAwesomeIcon icon={faFileArrowDown} className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-foreground">{booking.offeringTitle}</p>
        <p className="truncate text-[13px] text-muted-foreground">{booking.creatorName ?? 'Digital product'}</p>
      </div>
      <Button size="sm" className="h-9 rounded-lg" disabled={!paid || loading} onClick={download}>
        {loading ? <Spinner /> : <><FontAwesomeIcon icon={faFileArrowDown} className="size-3.5 mr-1.5" /> Download</>}
      </Button>
    </div>
  )
}
