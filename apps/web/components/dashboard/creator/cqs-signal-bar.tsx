'use client'

import { Progress } from '@/components/ui/progress'

interface CQSSignalBarProps {
  label: string
  value: number
  displayValue: string
  index?: number
}

export function CQSSignalBar({ label, value, displayValue, index = 0 }: CQSSignalBarProps): React.ReactElement {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <Progress value={value} className="flex-1 h-1.5" />
      <span className="text-xs font-medium tabular-nums w-12 text-right">{displayValue}</span>
    </div>
  )
}
