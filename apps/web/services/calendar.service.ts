import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'

export interface CalendarStatus {
  connected: boolean
  accountEmail?: string
}

export const calendarService = {
  getStatus: (cookieHeader?: string) =>
    api.get<CalendarStatus>(endpoints.calendar.status, { cookieHeader }),

  disconnect: () =>
    api.delete<{ success: boolean }>(endpoints.calendar.disconnect),
}
