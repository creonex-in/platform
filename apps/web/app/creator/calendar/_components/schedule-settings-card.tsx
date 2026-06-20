import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TIMEZONES = [
  { value: 'Asia/Kolkata',        label: '(GMT+5:30) India' },
  { value: 'Asia/Dubai',          label: '(GMT+4:00) Dubai' },
  { value: 'Asia/Singapore',      label: '(GMT+8:00) Singapore' },
  { value: 'Asia/Tokyo',          label: '(GMT+9:00) Tokyo' },
  { value: 'Asia/Shanghai',       label: '(GMT+8:00) China' },
  { value: 'Europe/London',       label: '(GMT+0:00) London' },
  { value: 'Europe/Paris',        label: '(GMT+1:00) Paris' },
  { value: 'Europe/Berlin',       label: '(GMT+1:00) Berlin' },
  { value: 'Africa/Cairo',        label: '(GMT+2:00) Cairo' },
  { value: 'America/New_York',    label: '(GMT-5:00) New York' },
  { value: 'America/Chicago',     label: '(GMT-6:00) Chicago' },
  { value: 'America/Denver',      label: '(GMT-7:00) Denver' },
  { value: 'America/Los_Angeles', label: '(GMT-8:00) Los Angeles' },
  { value: 'America/Sao_Paulo',   label: '(GMT-3:00) São Paulo' },
  { value: 'Pacific/Auckland',    label: '(GMT+12:00) Auckland' },
]

interface Props {
  name: string
  timezone: string
  onNameChange: (v: string) => void
  onTimezoneChange: (v: string) => void
}

export function ScheduleSettingsCard({ name, timezone, onNameChange, onTimezoneChange }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="schedule-name" className="text-xs font-medium text-muted-foreground">
            Schedule name
          </Label>
          <Input
            id="schedule-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            maxLength={40}
            placeholder="My schedule"
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Timezone</Label>
          <Select value={timezone} onValueChange={(v) => { if (v) onTimezoneChange(v) }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value} className="text-sm">
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
