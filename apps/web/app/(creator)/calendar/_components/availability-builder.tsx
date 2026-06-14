'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { scheduleService } from '@/services/schedule.service'
import type { Schedule, ScheduleOverride } from '@/types/schedule'
import type { CalendarStatus } from '@/services/calendar.service'
import { WeeklyScheduleCard } from '@/components/scheduling/weekly-schedule-card'
import { buildDayRows, type DayCode, type DayRow } from '@/components/scheduling/types'
import { ScheduleSettingsCard } from './schedule-settings-card'
import { BlockedDatesCard } from './blocked-dates-card'
import { CalendarConnectCard } from './calendar-connect-card'

type SaveState = 'idle' | 'saving' | 'saved'

function daysEqual(a: DayRow[], b: DayRow[]): boolean {
  return a.every((row, i) =>
    row.enabled === b[i].enabled &&
    row.startTime === b[i].startTime &&
    row.endTime === b[i].endTime,
  )
}

interface Props {
  initialSchedule: Schedule | null
  initialCalendarStatus: CalendarStatus
  calendarJustConnected?: boolean
}

export function AvailabilityBuilder({ initialSchedule, initialCalendarStatus, calendarJustConnected }: Props) {
  const initialRows = buildDayRows(initialSchedule)

  const [scheduleId, setScheduleId] = useState<string | null>(initialSchedule?.id ?? null)
  const [days, setDays] = useState<DayRow[]>(initialRows)
  const [savedDays, setSavedDays] = useState<DayRow[]>(initialRows)
  const [scheduleName, setScheduleName] = useState(initialSchedule?.name ?? 'Default')
  const [savedName, setSavedName] = useState(initialSchedule?.name ?? 'Default')
  const [timezone, setTimezone] = useState(initialSchedule?.timezone ?? 'Asia/Kolkata')
  const [savedTimezone, setSavedTimezone] = useState(initialSchedule?.timezone ?? 'Asia/Kolkata')
  const [overrides, setOverrides] = useState<ScheduleOverride[]>(
    (initialSchedule?.overrides ?? []).filter((o) => o.type === 'blocked'),

  )
  const [saveState, setSaveState] = useState<SaveState>('idle')

  useEffect(() => {
    if (calendarJustConnected) toast.success('Google Calendar connected successfully')
  }, [calendarJustConnected])

  const isNew = scheduleId === null
  const hasChanges =
    !daysEqual(days, savedDays) ||
    scheduleName !== savedName ||
    timezone !== savedTimezone

  function handleToggleDay(dayCode: DayCode, enabled: boolean) {
    setDays((prev) => prev.map((d) => (d.dayCode === dayCode ? { ...d, enabled } : d)))
  }

  function handleChangeTime(dayCode: DayCode, field: 'startTime' | 'endTime', value: string) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayCode !== dayCode) return d
        if (field === 'startTime' && value >= d.endTime) {
          const [h, m] = value.split(':').map(Number)
          const totalMin = h * 60 + m + 30
          const bumpH = Math.floor(totalMin / 60)
          const bumpM = totalMin % 60
          const newEnd = `${String(Math.min(bumpH, 22)).padStart(2, '0')}:${String(bumpM).padStart(2, '0')}`
          return { ...d, startTime: value, endTime: newEnd }
        }
        return { ...d, [field]: value }
      }),
    )
  }

  async function handleSave() {
    if (!days.some((d) => d.enabled)) {
      toast.warning('No days enabled — learners won\'t see any available slots.')
    }
    setSaveState('saving')
    try {
      let sid = scheduleId

      if (!sid) {
        const created = await scheduleService.createSchedule({
          name: scheduleName,
          timezone,
          isDefault: true,
        })
        sid = created.id
        setScheduleId(sid)
      } else if (scheduleName !== savedName || timezone !== savedTimezone) {
        await scheduleService.updateSchedule(sid, { name: scheduleName, timezone })
      }

      const newRuleIds: Partial<Record<DayCode, string>> = {}
      const mutations: Promise<unknown>[] = []

      for (let i = 0; i < days.length; i++) {
        const now = days[i]
        const was = savedDays[i]

        if (!was.enabled && now.enabled) {
          mutations.push(
            scheduleService
              .createRule(sid, {
                rrule: `FREQ=WEEKLY;BYDAY=${now.dayCode}`,
                startTime: now.startTime,
                endTime: now.endTime,
              })
              .then((rule) => {
                newRuleIds[now.dayCode] = rule.id
              }),
          )
        } else if (was.enabled && !now.enabled && was.ruleId) {
          mutations.push(scheduleService.deleteRule(sid, was.ruleId))
        } else if (
          was.enabled &&
          now.enabled &&
          was.ruleId &&
          (was.startTime !== now.startTime || was.endTime !== now.endTime)
        ) {
          mutations.push(
            scheduleService.updateRule(sid, was.ruleId, {
              startTime: now.startTime,
              endTime: now.endTime,
            }),
          )
        }
      }

      await Promise.all(mutations)

      const reconciled = days.map((d) => ({
        ...d,
        ruleId: d.enabled ? (newRuleIds[d.dayCode] ?? d.ruleId) : null,
      }))

      setDays(reconciled)
      setSavedDays(reconciled)
      setSavedName(scheduleName)
      setSavedTimezone(timezone)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      toast.error('Failed to save. Please try again.')
      setSaveState('idle')
    }
  }

  const saveButton = (
    <Button
      size="sm"
      variant={saveState === 'saved' ? 'outline' : 'default'}
      disabled={(!hasChanges && saveState === 'idle') || saveState === 'saving'}
      onClick={handleSave}
      className="h-8 px-4 text-xs"
    >
      {saveState === 'saving' && (
        <span className="mr-1.5 size-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent inline-block" />
      )}
      {saveState === 'saved' && (
        <FontAwesomeIcon icon={faCheck} className="mr-1.5 size-3 text-emerald-500" />
      )}
      {saveState === 'saving'
        ? 'Saving…'
        : saveState === 'saved'
          ? 'Saved'
          : hasChanges
            ? 'Save changes'
            : 'Save'}
    </Button>
  )

  return (
    <>
      <DashboardTopbar title="Availability" action={saveButton} />
      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-3">
        <WeeklyScheduleCard
          days={days}
          isNew={isNew}
          onToggleDay={handleToggleDay}
          onChangeTime={handleChangeTime}
        />
        <div className="flex flex-col gap-4">
          <ScheduleSettingsCard
            name={scheduleName}
            timezone={timezone}
            onNameChange={setScheduleName}
            onTimezoneChange={setTimezone}
          />
          <BlockedDatesCard
            scheduleId={scheduleId}
            overrides={overrides}
            onOverridesChange={setOverrides}
          />
          <CalendarConnectCard initialStatus={initialCalendarStatus} />
        </div>
      </div>
    </>
  )
}
