import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { CreatorBookingItem } from '@creonex/types'

export const bookingsService = {
  getCreatorBookings: (cookieHeader?: string) =>
    api.get<CreatorBookingItem[]>(endpoints.bookings.creatorList, { cookieHeader }),

  cancelBooking: (id: string, reason?: string) =>
    api.post<void>(endpoints.bookings.cancelById(id), { reason }),
}
