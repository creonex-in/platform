import type { Schedule } from '@/types/schedule'

export type DayCode = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU'

export interface DayRow {
  dayCode: DayCode
  label: string
  enabled: boolean
  startTime: string // 'HH:MM'
  endTime: string // 'HH:MM'
  ruleId: string | null
}

export const DAY_ORDER: DayCode[] = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

export const DAY_LABELS: Record<DayCode, string> = {
  MO: 'Monday', TU: 'Tuesday', WE: 'Wednesday', TH: 'Thursday',
  FR: 'Friday', SA: 'Saturday', SU: 'Sunday',
}

/** Build the 7-row weekly grid from a saved Schedule (one rule per day). */
export function buildDayRows(schedule: Schedule | null): DayRow[] {
  return DAY_ORDER.map((dayCode) => {
    const rule = schedule?.rules?.find((r) => r.rrule.includes(`BYDAY=${dayCode}`))
    return {
      dayCode,
      label: DAY_LABELS[dayCode],
      enabled: !!rule,
      startTime: rule?.startTime ?? '09:00',
      endTime: rule?.endTime ?? '17:00',
      ruleId: rule?.id ?? null,
    }
  })
}
