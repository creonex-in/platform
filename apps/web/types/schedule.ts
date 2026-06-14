import type { OverrideType } from '@creonex/types'

export interface ScheduleRule {
  id: string
  scheduleId: string
  rrule: string
  startTime: string
  endTime: string
}

export interface ScheduleOverride {
  id: string
  scheduleId: string
  date: string
  type: OverrideType
  startTime?: string
  endTime?: string
}

export interface Schedule {
  id: string
  name: string
  timezone: string
  isDefault: boolean
  rules: ScheduleRule[]
  overrides: ScheduleOverride[]
}
