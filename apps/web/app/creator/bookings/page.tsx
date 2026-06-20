import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shared/dashboard-shell'
import { getCreatorBookings } from '@/dal/bookings.dal'
import { BookingsClient } from './_components/bookings-client'
import { BookingsSkeleton } from './_components/bookings-skeleton'

async function BookingsContent() {
  const bookings = await getCreatorBookings()
  return <BookingsClient bookings={bookings} />
}

export default function BookingsPage(): React.ReactElement {
  return (
    <DashboardShell title="Bookings">
      <Suspense fallback={<BookingsSkeleton />}>
        <BookingsContent />
      </Suspense>
    </DashboardShell>
  )
}
