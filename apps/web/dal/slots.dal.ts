import 'server-only'
import { cache } from 'react'
import { slotsService } from '@/services/slots.service'
import type { PublicCreatorProfile } from '@creonex/types'

export interface AvailableDate {
  dayName: string
  date: string
  slotCount: number
  urgent: boolean
}

export const getCreatorAvailabilityDates = cache(
  async (profile: PublicCreatorProfile): Promise<AvailableDate[]> => {
    try {
      const proxy = profile.offerings.find(
        (o) => o.type === 'one_on_one' || o.type === 'group',
      )
      if (!proxy) return []

      const today = new Date()
      const from = today.toISOString().slice(0, 10)
      const toDate = new Date(today)
      toDate.setDate(today.getDate() + 21)
      const to = toDate.toISOString().slice(0, 10)

      const slots = await slotsService.getSlots(proxy.id, 'Asia/Kolkata', from, to)

      const byDate = new Map<string, number>()
      for (const slot of slots) {
        const ist = new Date(new Date(slot.start).getTime() + 5.5 * 60 * 60 * 1000)
        const key = ist.toISOString().slice(0, 10)
        byDate.set(key, (byDate.get(key) ?? 0) + 1)
      }

      return [...byDate.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(0, 10)
        .map(([dateStr, slotCount]) => {
          const d = new Date(dateStr + 'T00:00:00')
          return {
            dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
            date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            slotCount,
            urgent: slotCount === 1,
          }
        })
    } catch {
      return []
    }
  },
)
