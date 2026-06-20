import { Suspense } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/dashboard/shared/dashboard-shell'
import { buttonVariants } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { getMyOfferings, getMyOfferingStats } from '@/dal/offerings.dal'
import { getCreatorContext } from '@/dal/users.dal'
import { cn } from '@/lib/utils'
import { OffersList } from './_components/offers-list'
import { OffersSkeleton } from './_components/offers-skeleton'

export const metadata = { title: 'My Offers — Creonex' }

async function OffersContent(): Promise<React.ReactElement> {
  const [offerings, stats, { profile }] = await Promise.all([
    getMyOfferings(),
    getMyOfferingStats(),
    getCreatorContext(),
  ])
  const username = profile?.username ?? ''

  return <OffersList offerings={offerings} username={username} stats={stats} />
}

export default function OffersPage(): React.ReactElement {
  return (
    <DashboardShell
      title="My Offers"
      action={
        <Link href="/offers/new" className={cn(buttonVariants({ size: 'sm' }), 'text-xs')}>
          <FontAwesomeIcon icon={faPlus} className="size-3.5 mr-1" />
          New offer
        </Link>
      }
    >
      <Suspense fallback={<OffersSkeleton />}>
        <OffersContent />
      </Suspense>
    </DashboardShell>
  )
}
