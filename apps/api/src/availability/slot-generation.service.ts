import { Injectable } from '@nestjs/common'
import { addMinutes, addDays } from 'date-fns'
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'
import { rrulestr } from 'rrule'
import { SchedulesRepository } from './schedules.repository'
import { CalendarAuthService, type FreeBusyInterval } from '../calendar/calendar-auth.service'

export interface AvailableSlot {
  start: string       // ISO 8601 UTC
  end: string         // ISO 8601 UTC
  startLocal: string  // ISO 8601 in learner tz (for display in the picker)
}

@Injectable()
export class SlotGenerationService {
  constructor(
    private readonly schedulesRepo: SchedulesRepository,
    private readonly calendarAuth: CalendarAuthService,
  ) {}

  async generateSlots(
    params: {
      offeringId: string
      learnerTz: string
      fromDate?: string  // YYYY-MM-DD
      toDate?: string    // YYYY-MM-DD
    },
    opts: { ignoreExistingBookings?: boolean } = {},
  ): Promise<AvailableSlot[]> {
    const data = await this.schedulesRepo.findOfferingWithScheduleData(params.offeringId)
    if (!data) return []

    const { offering, schedule } = data
    const { rules, overrides } = schedule
    if (!rules.length) return []

    const durationMin = offering.durationMinutes ?? 30
    const bufferMin = offering.bufferAfterMinutes ?? 0
    const now = new Date()

    // Window boundaries (UTC)
    const windowStart = addMinutes(now, offering.minNoticeMinutes ?? 120)
    const windowEnd = params.toDate
      ? fromZonedTime(`${params.toDate}T23:59:59`, params.learnerTz)
      : addDays(now, offering.bookingWindowDays ?? 30)

    const fromUtc = params.fromDate
      ? fromZonedTime(`${params.fromDate}T00:00:00`, params.learnerTz)
      : windowStart

    const effectiveStart = fromUtc > windowStart ? fromUtc : windowStart

    // Blocked and custom overrides indexed by date string (creator tz)
    const blockedDates = new Set(
      overrides.filter((o) => o.type === 'blocked').map((o) => o.date),
    )
    const customOverrides = new Map(
      overrides
        .filter((o) => o.type === 'custom' && o.startTime && o.endTime)
        .map((o) => [o.date, { startTime: o.startTime!, endTime: o.endTime! }]),
    )

    // Existing booked slot start times (UTC ISO strings for fast lookup).
    // Skipped during booking validation so a learner's own pending hold (or a
    // race) doesn't hide an otherwise-valid slot — the DB unique index is the
    // real double-booking guard.
    const bookedRows = opts.ignoreExistingBookings
      ? []
      : await this.schedulesRepo.findActiveBookings(params.offeringId, effectiveStart, windowEnd)
    const bookedSet = new Set(
      bookedRows.map((b) => b.startTime?.toISOString()).filter(Boolean),
    )

    // Google Calendar freebusy — gracefully ignored if not connected
    let busyIntervals: FreeBusyInterval[] = []
    try {
      busyIntervals = await this.calendarAuth.getFreeBusy(
        data.offering.creatorProfileId,
        effectiveStart,
        windowEnd,
      )
    } catch {
      // calendar not connected or token error — proceed without freebusy
    }

    const slots: AvailableSlot[] = []

    // RRULE must expand in the creator's LOCAL wall-clock so BYDAY weekdays line up
    // with the creator's calendar. rrule matches BYDAY in the DTSTART's own frame, so
    // we anchor DTSTART to a tz-NAIVE UTC midnight of the creator-local start day:
    // each occurrence's UTC Y-M-D then IS the creator-local date, which we localize
    // back to real UTC for the actual slot times. (Anchoring with fromZonedTime shifts
    // the weekday by the tz offset — e.g. an IST Monday rule would surface on Tuesday.)
    const creatorStartDay = formatInTimeZone(effectiveStart, schedule.timezone, 'yyyy-MM-dd')
    const dtstartNaive = new Date(`${creatorStartDay}T00:00:00Z`)
    const dtstartStr = `${creatorStartDay.replace(/-/g, '')}T000000Z`
    const windowEndNaive = new Date(
      `${formatInTimeZone(windowEnd, schedule.timezone, "yyyy-MM-dd'T'HH:mm:ss")}Z`,
    )

    for (const rule of rules) {
      const rruleText = `DTSTART:${dtstartStr}\nRRULE:${rule.rrule}`
      let occurrences: Date[]
      try {
        occurrences = rrulestr(rruleText).between(dtstartNaive, windowEndNaive, true)
      } catch {
        continue
      }

      for (const occ of occurrences) {
        // occ is tz-naive UTC — its UTC date IS the creator-local date
        const localDateStr = occ.toISOString().slice(0, 10)

        // Skip blocked dates
        if (blockedDates.has(localDateStr)) continue

        // Use custom override hours if present, otherwise rule hours
        const custom = customOverrides.get(localDateStr)
        const startTime = custom?.startTime ?? rule.startTime
        const endTime = custom?.endTime ?? rule.endTime

        // Generate slots for this day
        const daySlotStart = fromZonedTime(`${localDateStr}T${startTime}:00`, schedule.timezone)
        const daySlotEnd = fromZonedTime(`${localDateStr}T${endTime}:00`, schedule.timezone)

        let cursor = daySlotStart
        while (addMinutes(cursor, durationMin) <= daySlotEnd) {
          const slotEnd = addMinutes(cursor, durationMin)

          // Skip past or too-soon slots
          if (cursor >= effectiveStart && cursor > windowStart) {
            const startIso = cursor.toISOString()
            const overlapsCalendar = busyIntervals.some(
              (b) => cursor < b.end && slotEnd > b.start,
            )
            if (!bookedSet.has(startIso) && !overlapsCalendar) {
              slots.push({
                start: startIso,
                end: slotEnd.toISOString(),
                startLocal: formatInTimeZone(cursor, params.learnerTz, "yyyy-MM-dd'T'HH:mm:ssxxx"),
              })
            }
          }

          cursor = addMinutes(cursor, durationMin + bufferMin)
        }
      }
    }

    // Deduplicate (multiple rules can generate same slot) and sort
    const seen = new Set<string>()
    return slots
      .filter((s) => {
        if (seen.has(s.start)) return false
        seen.add(s.start)
        return true
      })
      .sort((a, b) => a.start.localeCompare(b.start))
  }
}
