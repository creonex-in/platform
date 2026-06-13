// ── Scheduling / booking enums (runtime arrays — derive types from these) ─────

export const BOOKING_STATUSES = [
  'pending_payment', 'confirmed', 'cancelled', 'completed', 'refunded', 'no_show',
] as const

export const OVERRIDE_TYPES = [
  'blocked', 'custom',
] as const

export const MEETING_PROVIDERS = [
  'google_meet', 'zoom', 'teams',
] as const

export const CALENDAR_PROVIDERS = [
  'google',
] as const

/** Who triggered a booking cancellation. */
export const CANCELLED_BY = [
  'learner', 'creator', 'system',
] as const

// ── Types derived from arrays ─────────────────────────────────────────────────

export type BookingStatus = typeof BOOKING_STATUSES[number]
export type OverrideType = typeof OVERRIDE_TYPES[number]
export type MeetingProvider = typeof MEETING_PROVIDERS[number]
export type CalendarProvider = typeof CALENDAR_PROVIDERS[number]
export type CancelledBy = typeof CANCELLED_BY[number]

/** A single recurring availability window the builder emits; server turns
 *  `days` into an RRULE (`FREQ=WEEKLY;BYDAY=…`). Times are local to the schedule tz. */
export interface AvailabilityRuleInput {
  days: number[]      // 0=Sun … 6=Sat
  startTime: string   // 'HH:MM'
  endTime: string     // 'HH:MM'
}
