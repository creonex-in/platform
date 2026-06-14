import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getDefaultSchedule } from '@/dal/schedule.dal'
import { getCalendarStatus } from '@/dal/calendar.dal'
import { AvailabilityBuilder } from './_components/availability-builder'
import { ScheduleSkeleton } from './_components/schedule-skeleton'

export const metadata: Metadata = {
  title: 'Availability — Creonex',
}

interface Props {
  searchParams: Promise<{ calendar?: string }>
}

async function AvailabilityContent({ searchParams }: Props) {
  const [schedule, calendarStatus, params] = await Promise.all([
    getDefaultSchedule(),
    getCalendarStatus(),
    searchParams,
  ])

  return (
    <AvailabilityBuilder
      initialSchedule={schedule}
      initialCalendarStatus={calendarStatus}
      calendarJustConnected={params.calendar === 'connected'}
    />
  )
}

export default function CalendarPage(props: Props): React.ReactElement {
  return (
    <Suspense fallback={<ScheduleSkeleton />}>
      <AvailabilityContent {...props} />
    </Suspense>
  )
}
