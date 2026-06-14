import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { calendarService, type CalendarStatus } from '@/services/calendar.service'
import { isUnauthorized, isNotFound } from '@/lib/api'

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

export const getCalendarStatus = cache(async (): Promise<CalendarStatus> => {
  try {
    const cookieHeader = await getCookieHeader()
    return await calendarService.getStatus(cookieHeader)
  } catch (e) {
    if (isUnauthorized(e) || isNotFound(e)) return { connected: false }
    throw e
  }
})
