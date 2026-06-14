'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { OfferItem } from '@/components/dashboard/creator/offer-item'
import { StatPanel } from '@/components/dashboard/creator/stat-panel'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { FilterChipGroup } from '@/components/dashboard/learner/filter-chip-group'
import { buttonVariants } from '@/components/ui/button'
import {
  faBox,
  faCircleCheck,
  faCalendarCheck,
  faIndianRupeeSign,
} from '@fortawesome/free-solid-svg-icons'
import { formatCurrency } from '@/lib/utils'
import type { CreatorOffering, CreatorOfferStats } from '@creonex/types'

const categories = [
  { label: 'All', value: 'all' },
  { label: '1:1 Sessions', value: 'one_on_one' },
  { label: 'Workshops', value: 'workshop' },
  { label: 'Group Calls', value: 'group' },
  { label: 'Digital', value: 'digital' },
]

interface OffersListProps {
  offerings: CreatorOffering[]
  username: string
  stats: CreatorOfferStats
}

export function OffersList({ offerings, username, stats }: OffersListProps): React.ReactElement {
  const router = useRouter()
  const [category, setCategory] = useState('all')

  // Re-fetch the server component's data after a mutation (status change, etc).
  const onChanged = (): void => router.refresh()

  const filtered = category === 'all' ? offerings : offerings.filter((o) => o.type === category)

  return (
    <>
      {/* Stats — shared divided panel (same as the dashboard) */}
      <StatPanel
        stats={[
          { label: 'Total offers', value: stats.totalOffers.toString(), icon: faBox },
          { label: 'Live & active', value: stats.liveOffers.toString(), changeLabel: 'published', icon: faCircleCheck },
          { label: 'Total bookings', value: stats.totalBookings.toLocaleString('en-IN'), icon: faCalendarCheck },
          { label: 'Total revenue', value: formatCurrency(stats.totalRevenue), icon: faIndianRupeeSign },
        ]}
      />

      {/* Type filter — same chip group as bookings */}
      <FilterChipGroup chips={categories} value={category} onChange={setCategory} />

      {/* Offers */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={faBox}
            title="No offers found"
            description={
              category === 'all'
                ? 'Create your first offer to start earning.'
                : 'No offers in this category yet.'
            }
            action={
              <Link href="/offers/new" className={buttonVariants({ size: 'sm' })}>
                Create offer
              </Link>
            }
          />
        ) : (
          filtered.map((offer, i) => (
            <OfferItem
              key={offer.id}
              offer={offer}
              index={i}
              username={username}
              onChanged={onChanged}
            />
          ))
        )}
      </div>
    </>
  )
}
