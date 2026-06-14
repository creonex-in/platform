'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import { OfferItem } from '@/components/dashboard/creator/offer-item'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  faBox,
  faCircleCheck,
  faCalendarCheck,
  faIndianRupeeSign,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { CreatorOffering } from '@creonex/types'
import { cn } from '@/lib/utils'

const tabs: { value: string; label: string }[] = [
  { value: 'all', label: 'All Services' },
  { value: 'one_on_one', label: '1:1 Sessions' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'group', label: 'Group Calls' },
  { value: 'digital', label: 'Digital Products' },
]

interface OffersListProps {
  offerings: CreatorOffering[]
  username: string
}

export function OffersList({ offerings, username }: OffersListProps): React.ReactElement {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')

  // Re-fetch the server component's data after a mutation (status change, etc).
  const onChanged = (): void => router.refresh()

  // Calculate statistics for the ribbon
  const totalOfferings = offerings.length
  const liveOfferings = offerings.filter((o) => o.status === 'live').length
  const totalBookings = offerings.reduce((sum, o) => sum + o.totalBookings, 0)
  const totalRevenue = offerings.reduce((sum, o) => sum + o.totalRevenuePaise / 100, 0)

  const stats = [
    {
      label: 'Total Offers',
      value: totalOfferings.toString(),
      icon: faBox,
    },
    {
      label: 'Live & Active',
      value: liveOfferings.toString(),
      icon: faCircleCheck,
      isLive: true,
    },
    {
      label: 'Total Bookings',
      value: totalBookings.toLocaleString('en-IN'),
      icon: faCalendarCheck,
    },
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: faIndianRupeeSign,
    },
  ]

  return (
    <div className="space-y-8">
      {/* ── Analytics Ribbon (Premium card-base widgets with entry animations) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: 'easeOut' }}
            className="card-base flex items-center justify-between gap-4 p-5 md:p-6"
          >
            <div className="space-y-1">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground leading-none">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mt-1.5 flex items-center gap-1.5">
                {stat.isLive && (
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                )}
                {stat.value}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/5 text-primary border border-primary/10 shrink-0">
              <FontAwesomeIcon icon={stat.icon} className="size-5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Filtering Tabs and Content ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex w-full justify-start gap-1 overflow-x-auto bg-transparent p-0 scrollbar-hide border-b border-border/70 rounded-none h-auto pb-px">
          {tabs.map((t) => {
            const count = t.value === 'all' ? offerings.length : offerings.filter((o) => o.type === t.value).length
            return (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className={cn(
                  'relative px-4 py-3 rounded-none text-xs md:text-sm font-semibold border-b-2 border-transparent transition-all shadow-none bg-transparent hover:text-foreground/80',
                  'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-t-lg',
                )}
              >
                <span className="flex items-center gap-2">
                  {t.label}
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-muted text-muted-foreground',
                      'group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary',
                    )}
                  >
                    {count}
                  </span>
                </span>
              </TabsTrigger>
            )
          })}
        </TabsList>
        {tabs.map((t) => {
          // Dynamic mounting optimization to prevent layout lag and stuttering animation on tabs switch
          if (t.value !== activeTab) return null

          const filtered = t.value === 'all' ? offerings : offerings.filter((o) => o.type === t.value)
          return (
            <TabsContent key={t.value} value={t.value} className="space-y-3.5 outline-none focus:outline-none">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={faBox}
                  title="No offers found"
                  description={
                    t.value === 'all'
                      ? 'Create your first offer to start earning.'
                      : `You haven't created any ${t.label.toLowerCase()} yet.`
                  }
                  action={
                    <Link href="/offers/new" className={buttonVariants({ size: 'sm' })}>
                      Create offer
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filtered.map((offer, i) => (
                    <OfferItem
                      key={offer.id}
                      offer={offer}
                      index={i}
                      username={username}
                      onChanged={onChanged}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
