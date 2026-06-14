import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'

export interface SlotItem {
  start: string
  end: string
  startLocal: string
  endLocal: string
}

export const slotsService = {
  getSlots: (offeringId: string, timezone: string, from: string, to: string) => {
    const qs = new URLSearchParams({ timezone, from, to }).toString()
    return api.get<SlotItem[]>(`${endpoints.availability.slots(offeringId)}?${qs}`)
  },
}
