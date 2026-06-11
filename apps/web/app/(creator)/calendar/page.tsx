'use client'

import { useState } from 'react'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { defaultSchedule, timeSlots, type DaySchedule } from '@/data/mock-creator-tools'
import { toast } from 'sonner'

export default function CalendarPage(): React.ReactElement {
  const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule)

  function update(day: string, patch: Partial<DaySchedule>): void {
    setSchedule((prev) => prev.map((d) => (d.day === day ? { ...d, ...patch } : d)))
  }

  return (
    <>
      <DashboardTopbar
        title="Calendar"
        action={
          <Button size="sm" className="text-xs" onClick={() => toast.success('Availability saved')}>
            Save
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly availability</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {schedule.map((d) => (
              <div
                key={d.day}
                className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="flex w-32 shrink-0 items-center gap-2.5">
                  <Switch
                    checked={d.enabled}
                    onCheckedChange={(v) => update(d.day, { enabled: v })}
                  />
                  <span className="text-sm font-medium">{d.day}</span>
                </div>
                {d.enabled ? (
                  <div className="flex items-center gap-2">
                    <Select value={d.start} onValueChange={(v) => update(d.day, { start: v ?? d.start })}>
                      <SelectTrigger className="h-9 w-28 rounded-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">–</span>
                    <Select value={d.end} onValueChange={(v) => update(d.day, { end: v ?? d.end })}>
                      <SelectTrigger className="h-9 w-28 rounded-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Block dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Add dates when you won&apos;t be available to take calls.
            </p>
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={() => toast.success('Pick dates to block')}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1.5 size-3.5" />
              Add unavailable dates
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
