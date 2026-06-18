'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  const src = booking.thumbnailUrl ?? booking.creatorPhotoUrl

  return (
    <div className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.12)]">
      <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-muted">
        {src ? (
          <Image src={src} alt={booking.offeringTitle} fill className="object-cover" sizes="56px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[var(--pastel-sage)]">
            <FontAwesomeIcon icon={faFileArrowDown} className="size-5" />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-foreground">{booking.offeringTitle}</p>
        <p className="truncate text-sm text-muted-foreground">{booking.creatorName ?? 'Digital product'}</p>
      </div>

      <Button
        size="default"
        className="h-10 shrink-0 rounded-xl"
        disabled={!paid || loading}
        onClick={download}
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
            <FontAwesomeIcon icon={faFileArrowDown} className="size-3.5 mr-1.5" />
            Download
          </>
        )}
      </Button>
    </div>
  )
}
