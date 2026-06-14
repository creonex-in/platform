'use client'

import { useState } from 'react'
import { BookingRow } from '@/components/dashboard/creator/booking-row'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { FilterChipGroup } from '@/components/dashboard/learner/filter-chip-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'
import type { CreatorBookingItem, CreatorBookingStatus } from '@creonex/types'
import type { OfferType } from '@/types/offer'

const statusTabs: { value: string; label: string; statuses: CreatorBookingStatus[] }[] = [
  { value: 'upcoming', label: 'Upcoming', statuses: ['pending_payment', 'confirmed'] },
  { value: 'completed', label: 'Completed', statuses: ['completed'] },
  { value: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
]

const categories = [
  { label: '1:1 Calls', value: 'one_on_one' },
  { label: 'Workshops', value: 'workshop' },
  { label: 'Group', value: 'group' },
  { label: 'Products', value: 'digital' },
  { label: 'All', value: 'all' },
]

interface Props {
  bookings: CreatorBookingItem[]
}

export function BookingsClient({ bookings }: Props): React.ReactElement {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [category, setCategory] = useState('all')

  return (
    <>
      <FilterChipGroup chips={categories} value={category} onChange={setCategory} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {statusTabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {statusTabs.map((t) => {
          const filtered = bookings.filter(
            (b) =>
              t.statuses.includes(b.status) &&
              (category === 'all' || b.offeringType === (category as OfferType))
          )
          return (
            <TabsContent key={t.value} value={t.value} className="space-y-2">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={faCalendar}
                  title="No bookings"
                  description="Bookings will appear here once learners start booking your offers."
                />
              ) : (
                filtered.map((booking, i) => (
                  <BookingRow key={booking.id} booking={booking} index={i} />
                ))
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </>
  )
}
