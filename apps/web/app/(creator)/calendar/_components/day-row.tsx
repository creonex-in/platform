import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DayRow as DayRowType } from './availability-builder'

export interface TimeSlot {
  value: string
  label: string
}

export function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      const ampm = h < 12 ? 'AM' : 'PM'
      const label = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
      slots.push({ value, label })
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

interface Props {
  row: DayRowType
  onToggle: (enabled: boolean) => void
  onChangeTime: (field: 'startTime' | 'endTime', value: string) => void
}

export function DayRow({ row, onToggle, onChangeTime }: Props) {
  const endSlots = TIME_SLOTS.filter((s) => s.value > row.startTime)

  return (
    <div className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="flex w-36 shrink-0 items-center gap-2.5">
        <Switch
          checked={row.enabled}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-primary"
        />
        <span className="text-sm font-medium">{row.label}</span>
      </div>

      {row.enabled ? (
        <div className="flex items-center gap-2">
          <Select value={row.startTime} onValueChange={(v) => onChangeTime('startTime', v)}>
            <SelectTrigger className="h-8 w-[7.5rem] rounded-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.filter((s) => s.value < '22:00').map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground">—</span>

          <Select value={row.endTime} onValueChange={(v) => onChangeTime('endTime', v)}>
            <SelectTrigger className="h-8 w-[7.5rem] rounded-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {endSlots.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <span className="text-sm italic text-muted-foreground">Unavailable</span>
      )}
    </div>
  )
}
