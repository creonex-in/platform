'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { OfferItem } from '@/components/dashboard/creator/offer-item'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faBox } from '@fortawesome/free-solid-svg-icons'
import { mockOffers } from '@/data/mock-offers'
import type { OfferType } from '@/types/offer'
import { cn } from '@/lib/utils'

const tabs: { value: string; label: string; type?: OfferType }[] = [
  { value: 'all', label: 'All' },
  { value: 'one_on_one', label: '1:1 Calls', type: 'one_on_one' },
  { value: 'workshop', label: 'Workshops', type: 'workshop' },
  { value: 'group', label: 'Group', type: 'group' },
  { value: 'digital', label: 'Digital', type: 'digital' },
]

export default function OffersPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState('all')

  const filteredOffers = activeTab === 'all'
    ? mockOffers
    : mockOffers.filter((o) => o.type === activeTab)

  return (
    <>
      <DashboardTopbar
        title="My Offers"
        action={
          <Link href="/creator/offers/new" className={cn(buttonVariants({ size: 'sm' }), 'text-xs')}>
            <FontAwesomeIcon icon={faPlus} className="size-3.5 mr-1" />
            New offer
          </Link>
        }
      />
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((t) => (
            <TabsContent key={t.value} value={t.value} className="space-y-2">
              {filteredOffers.length === 0 ? (
                <EmptyState
                  icon={faBox}
                  title="No offers yet"
                  description="Create your first offer to start earning."
                  action={
                    <Link href="/creator/offers/new" className={buttonVariants({ size: 'sm' })}>
                      Create offer
                    </Link>
                  }
                />
              ) : (
                filteredOffers.map((offer, i) => (
                  <OfferItem key={offer.id} offer={offer} index={i} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
}
