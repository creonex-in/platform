import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { bookingsService } from '@/services/bookings.service'
import { isUnauthorized } from '@/lib/api'
import type { CreatorBookingItem } from '@creonex/types'

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

export const getCreatorBookings = cache(async (): Promise<CreatorBookingItem[]> => {
  try {
    return await bookingsService.getCreatorBookings(await getCookieHeader())
  } catch (e) {
    if (isUnauthorized(e)) return []
    throw e
  }
})
