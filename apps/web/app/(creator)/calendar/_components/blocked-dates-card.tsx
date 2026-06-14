'use client'

import { useState } from 'react'
import { toast } from '@/lib/toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { scheduleService } from '@/services/schedule.service'
import type { ScheduleOverride } from '@/types/schedule'

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

interface Props {
  scheduleId: string | null
  overrides: ScheduleOverride[]
  onOverridesChange: (overrides: ScheduleOverride[]) => void
}

export function BlockedDatesCard({ scheduleId, overrides, onOverridesChange }: Props) {
  const [dateInput, setDateInput] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleAdd() {
    if (!dateInput || !scheduleId) return
    setIsAdding(true)
    try {
      const override = await scheduleService.createOverride(scheduleId, {
        date: dateInput,
        type: 'blocked',
      })
      onOverridesChange([...overrides, override])
      setDateInput('')
    } catch {
      toast.error('Failed to block date. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  async function handleRemove(override: ScheduleOverride) {
    if (!scheduleId) return
    setRemovingId(override.id)
    const prev = overrides
    onOverridesChange(overrides.filter((o) => o.id !== override.id))
    try {
      await scheduleService.deleteOverride(scheduleId, override.id)
    } catch {
      toast.error('Failed to remove blocked date.')
      onOverridesChange(prev)
    } finally {
      setRemovingId(null)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Blocked dates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Mark dates when you're fully unavailable
        </p>

        {overrides.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {overrides.map((o) => (
              <Badge
                key={o.id}
                variant="outline"
                className="pl-2.5 pr-1.5 py-1 h-auto gap-1.5 text-xs font-normal"
              >
                {formatDate(o.date)}
                <button
                  onClick={() => handleRemove(o)}
                  disabled={removingId === o.id}
                  className="flex items-center justify-center rounded-sm opacity-60 hover:opacity-100 transition-opacity disabled:opacity-30"
                  aria-label={`Remove ${formatDate(o.date)}`}
                >
                  <FontAwesomeIcon icon={faXmark} className="size-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateInput}
            min={today}
            onChange={(e) => setDateInput(e.target.value)}
            className="h-8 flex-1 text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 text-xs"
            onClick={handleAdd}
            disabled={!dateInput || !scheduleId || isAdding}
          >
            {isAdding ? (
              <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              'Add'
            )}
          </Button>
        </div>

        {!scheduleId && (
          <p className="text-[10px] text-muted-foreground/60">
            Save your schedule first to block dates
          </p>
        )}
      </CardContent>
    </Card>
  )
}
