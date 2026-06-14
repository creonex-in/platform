'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { WeeklyScheduleCard } from './weekly-schedule-card'
import { DAY_ORDER, DAY_LABELS, type DayCode, type DayRow } from './types'

export interface AvailabilityValue {
  timezone: string
  days: DayRow[]
}

const DEFAULT_ENABLED: Record<DayCode, boolean> = {
  MO: true, TU: true, WE: true, TH: true, FR: true, SA: false, SU: false,
}

/** Seed value: Mon–Fri 09:00–17:00 in the visitor's detected timezone. */
export function defaultAvailability(): AvailabilityValue {
  const timezone =
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata'
  return {
    timezone,
    days: DAY_ORDER.map((dayCode) => ({
      dayCode,
      label: DAY_LABELS[dayCode],
      enabled: DEFAULT_ENABLED[dayCode],
      startTime: '09:00',
      endTime: '17:00',
      ruleId: null,
    })),
  }
}

interface Props {
  value: AvailabilityValue
  onChange: (next: AvailabilityValue) => void
}

/**
 * Controlled, presentational weekly-availability editor. The parent owns the
 * value; this component encapsulates the toggle / time-change logic and emits a
 * plain payload. The API turns each enabled day into a `schedule_rules` row.
 */
export function AvailabilityScheduleBuilder({ value, onChange }: Props) {
  const setDays = (days: DayRow[]) => onChange({ ...value, days })

  const toggleDay = (dayCode: DayCode, enabled: boolean) =>
    setDays(value.days.map((d) => (d.dayCode === dayCode ? { ...d, enabled } : d)))

  const changeTime = (dayCode: DayCode, field: 'startTime' | 'endTime', v: string) =>
    setDays(
      value.days.map((d) => {
        if (d.dayCode !== dayCode) return d
        // Keep end after start — bump end +30m if a later start would cross it.
        if (field === 'startTime' && v >= d.endTime) {
          const [h, m] = v.split(':').map(Number)
          const total = h * 60 + m + 30
          const end = `${String(Math.min(Math.floor(total / 60), 22)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
          return { ...d, startTime: v, endTime: end }
        }
        return { ...d, [field]: v }
      }),
    )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FontAwesomeIcon icon={faGlobe} className="size-3.5 text-primary" />
          Timezone
        </div>
        <TimezoneSelect value={value.timezone} onChange={(tz) => onChange({ ...value, timezone: tz })} />
      </div>

      <WeeklyScheduleCard
        days={value.days}
        isNew={false}
        onToggleDay={toggleDay}
        onChangeTime={changeTime}
      />
    </div>
  )
}

// Full IANA list where supported, with a sensible curated fallback.
const TIMEZONES: string[] = (() => {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf
    if (typeof fn === 'function') return fn('timeZone')
  } catch { /* noop */ }
  return [
    'Asia/Kolkata', 'UTC', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo',
    'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Chicago',
    'America/Los_Angeles', 'Australia/Sydney',
  ]
})()

function TimezoneSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = TIMEZONES.includes(value) ? TIMEZONES : [value, ...TIMEZONES]
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Your timezone"
        className="appearance-none h-9 max-w-52 truncate rounded-lg border border-border bg-background pl-3 pr-7 text-xs font-semibold text-foreground hover:border-primary/40 focus:outline-none focus:border-primary/60 cursor-pointer transition-colors"
      >
        {options.map((z) => (
          <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>
        ))}
      </select>
      <FontAwesomeIcon icon={faChevronDown} className="absolute right-2.5 top-1/2 -translate-y-1/2 size-2.5 text-muted-foreground pointer-events-none" />
    </div>
  )
}
