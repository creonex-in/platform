'use client'

import { useFormContext } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faCalendarDays, faUsers, faFileLines, faBullseye } from '@fortawesome/free-solid-svg-icons'
import type { OfferDisplayType as OfferType } from '@/types/offer'
import type { OfferFormValues } from './index'
import { formatCurrency } from '@/lib/utils'

const typeConfig: Record<OfferType, { label: string; icon: typeof faPhone }> = {
  one_on_one: { label: '1:1 Session', icon: faPhone },
  workshop: { label: 'Workshop', icon: faCalendarDays },
  group: { label: 'Group Call', icon: faUsers },
  digital: { label: 'Digital', icon: faFileLines },
  community: { label: 'Community', icon: faUsers },
  coaching_plan: { label: 'Coaching Plan', icon: faBullseye },
}

export function Step4Review(): React.ReactElement {
  const { watch } = useFormContext<OfferFormValues>()
  const values = watch()
  const conf = values.type ? typeConfig[values.type as OfferType] : null

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold">Review your offer</h3>
        <p className="text-sm text-muted-foreground mt-1">Check the details before publishing.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        {conf && (
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FontAwesomeIcon icon={conf.icon} className="size-4" />
            </div>
            <span className="text-sm font-medium">{conf.label}</span>
          </div>
        )}

        {values.title && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Title</p>
            <p className="text-sm font-medium">{values.title}</p>
          </div>
        )}

        {values.description && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm text-muted-foreground">{values.description}</p>
          </div>
        )}

        <div className="flex items-center gap-6 text-sm">
          {values.duration > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-medium">{values.duration} min</p>
            </div>
          )}
          {values.price > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-medium">{formatCurrency(values.price)}</p>
            </div>
          )}
          {values.price > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">You earn</p>
              <p className="font-medium text-foreground">{formatCurrency(values.price * 0.9)}</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Your offer will go live immediately after publishing. You can edit or unpublish it anytime.
      </p>
    </div>
  )
}
