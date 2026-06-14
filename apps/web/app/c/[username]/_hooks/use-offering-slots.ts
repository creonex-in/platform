'use client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { slotsService, type SlotItem } from '@/services/slots.service'

export interface SlotsByDate {
  [date: string]: SlotItem[]
}

export interface OfferingSlots {
  /** Flat list as returned by the API (for lookups by UTC instant). */
  slots: SlotItem[]
  /** Slots grouped by local date "YYYY-MM-DD" in the selected tz. */
  slotsByDate: SlotsByDate
  /** Sorted local dates that have at least one slot. */
  availableDates: string[]
  loading: boolean
}

const WINDOW_DAYS = 28

function fetchSlots(offeringId: string, tz: string): Promise<SlotItem[]> {
  const now = new Date()
  const from = now.toISOString().slice(0, 10)
  const toDate = new Date(now)
  toDate.setDate(now.getDate() + WINDOW_DAYS)
  const to = toDate.toISOString().slice(0, 10)
  return slotsService.getSlots(offeringId, tz, from, to)
}

/**
 * Bookable slots for an offering over the next 4 weeks, in `tz`.
 *
 * React Query owns fetching (per-(offering, tz) cache, dedup, out-of-order
 * protection, refetch). `slots` is the source of truth; `slotsByDate` and
 * `availableDates` are derived (memoised), not stored.
 */
export function useOfferingSlots(offeringId: string, tz: string): OfferingSlots {
  const { data: slots = [], isPending } = useQuery({
    queryKey: ['offering-slots', offeringId, tz],
    queryFn: () => fetchSlots(offeringId, tz),
    staleTime: 60_000,
  })

  const slotsByDate = useMemo(() => {
    const grouped: SlotsByDate = {}
    for (const slot of slots) {
      // Group by LOCAL date (in `tz`) — read straight from startLocal.
      const date = slot.startLocal.slice(0, 10)
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(slot)
    }
    return grouped
  }, [slots])

  const availableDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate])

  return { slots, slotsByDate, availableDates, loading: isPending }
}
