import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type {
  CreatorBookingItem,
  CreateBookingRequest,
  CreateGuestBookingRequest,
  ConfirmBookingRequest,
  BookingCreatedResponse,
  BookingConfirmedResponse,
} from '@creonex/types'

export const bookingsService = {
  getCreatorBookings: (cookieHeader?: string) =>
    api.get<CreatorBookingItem[]>(endpoints.bookings.creatorList, { cookieHeader }),

  cancelBooking: (id: string, reason?: string) =>
    api.post<void>(endpoints.bookings.cancelById(id), { reason }),

  createBooking: (body: CreateBookingRequest) =>
    api.post<BookingCreatedResponse>(endpoints.bookings.create, body),

  createGuestBooking: (body: CreateGuestBookingRequest) =>
    api.post<BookingCreatedResponse>(endpoints.bookings.createGuest, body),

  confirmBooking: (id: string, body: ConfirmBookingRequest) =>
    api.post<BookingConfirmedResponse>(endpoints.bookings.confirm(id), body),

  confirmGuestBooking: (id: string, body: ConfirmBookingRequest) =>
    api.post<BookingConfirmedResponse>(endpoints.bookings.confirmGuest(id), body),
}
