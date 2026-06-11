'use client'

import { useState } from 'react'
import { WorkshopCard } from '@/components/dashboard/learner/workshop-card'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { FilterChipGroup } from '@/components/dashboard/learner/filter-chip-group'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import type { Offer } from '@/types/offer'
import type { Creator } from '@/types/creator'

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Workshops', value: 'workshop' },
  { label: 'Group', value: 'group' },
]

interface WorkshopsViewProps {
  offers: Offer[]
  creators: Creator[]
}

export function WorkshopsView({ offers, creators }: WorkshopsViewProps): React.ReactElement {
  const [filter, setFilter] = useState('all')

  const workshops = offers.filter((o) => {
    const isGroupType = o.type === 'workshop' || o.type === 'group'
    if (!isGroupType) return false
    if (filter === 'all') return true
    return o.type === filter
  })

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
        <p className="text-sm font-medium">Live group workshops</p>
        <p className="text-xs text-muted-foreground">
          Scheduled sessions you join live with other learners — limited seats.
        </p>
      </div>
      <FilterChipGroup chips={filters} value={filter} onChange={setFilter} />

      {workshops.length === 0 ? (
        <EmptyState
          icon={faCalendarDays}
          title="No workshops"
          description="No upcoming workshops right now. Check back soon."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workshops.map((offer, i) => {
            const creator = creators.find((c) =>
              c.tags.some((t) => offer.title.toLowerCase().includes(t.toLowerCase()))
            )
            return <WorkshopCard key={offer.id} offer={offer} creator={creator} index={i} />
          })}
        </div>
      )}
    </div>
  )
}
