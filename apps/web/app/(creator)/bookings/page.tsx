'use client'

import { useState } from 'react'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { BookingRow } from '@/components/dashboard/creator/booking-row'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { FilterChipGroup } from '@/components/dashboard/learner/filter-chip-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'
import { mockBookings } from '@/data/mock-bookings'
import type { BookingStatus } from '@/types/booking'
import type { OfferType } from '@/types/offer'

const statusTabs: { value: string; label: string; statuses: BookingStatus[] }[] = [
  { value: 'upcoming', label: 'Upcoming', statuses: ['upcoming', 'confirmed'] },
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

export default function BookingsPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [category, setCategory] = useState('all')

  return (
    <>
      <DashboardTopbar title="Bookings" />
      <div className="space-y-5 p-4 sm:p-6">
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
            const filtered = mockBookings.filter(
              (b) =>
                t.statuses.includes(b.status) &&
                (category === 'all' || b.offerType === (category as OfferType))
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
      </div>
    </>
  )
}
