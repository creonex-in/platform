import Link from 'next/link'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { buttonVariants } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { getMyOfferings } from '@/dal/offerings.dal'
import { getCreatorContext } from '@/dal/users.dal'
import { cn } from '@/lib/utils'
import { OffersList } from './_components/offers-list'

export const metadata = { title: 'My Offers — Creonex' }

export default async function OffersPage(): Promise<React.ReactElement> {
  const [offerings, { profile }] = await Promise.all([
    getMyOfferings(),
    getCreatorContext(),
  ])
  const username = profile?.username ?? ''

  return (
    <>
      <DashboardTopbar
        title="My Offers"
        action={
          <Link href="/offers/new" className={cn(buttonVariants({ size: 'sm' }), 'text-xs')}>
            <FontAwesomeIcon icon={faPlus} className="size-3.5 mr-1" />
            New offer
          </Link>
        }
      />
      <div className="space-y-5 p-4 sm:p-6">
        <OffersList offerings={offerings} username={username} />
      </div>
    </>
  )
}
