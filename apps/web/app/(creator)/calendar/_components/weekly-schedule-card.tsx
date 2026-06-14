import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DayRow } from './day-row'
import type { DayRow as DayRowType, DayCode } from './availability-builder'

interface Props {
  days: DayRowType[]
  isNew: boolean
  onToggleDay: (dayCode: DayCode, enabled: boolean) => void
  onChangeTime: (dayCode: DayCode, field: 'startTime' | 'endTime', value: string) => void
}

export function WeeklyScheduleCard({ days, isNew, onToggleDay, onChangeTime }: Props) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <CardTitle className="text-sm font-semibold">Weekly hours</CardTitle>
          {isNew && (
            <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
              New schedule
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Set the times you're typically available each week
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border pt-0">
        {days.map((row) => (
          <DayRow
            key={row.dayCode}
            row={row}
            onToggle={(enabled) => onToggleDay(row.dayCode, enabled)}
            onChangeTime={(field, value) => onChangeTime(row.dayCode, field, value)}
          />
        ))}
      </CardContent>
    </Card>
  )
}
