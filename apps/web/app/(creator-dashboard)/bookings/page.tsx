import { Suspense } from 'react'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { getCreatorBookings } from '@/dal/bookings.dal'
import { BookingsClient } from './_components/bookings-client'
import { BookingsSkeleton } from './_components/bookings-skeleton'

async function BookingsContent() {
  const bookings = await getCreatorBookings()
  return <BookingsClient bookings={bookings} />
}

export default function BookingsPage(): React.ReactElement {
  return (
    <>
      <DashboardTopbar title="Bookings" />
      <div className="space-y-5 p-4 sm:p-6">
        <Suspense fallback={<BookingsSkeleton />}>
          <BookingsContent />
        </Suspense>
      </div>
    </>
  )
}
