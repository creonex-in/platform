'use client'

import { getCQSTier, getCQSColor } from '@/lib/cqs'
import { cn } from '@/lib/utils'

interface CQSRingProps {
  score: number
  size?: number
  showLabel?: boolean
}

export function CQSRing({ score, size = 96, showLabel = true }: CQSRingProps): React.ReactElement {
  const tier = getCQSTier(score)
  const colorClass = getCQSColor(tier)

  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const targetDash = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size }} className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={6}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset: circumference - targetDash,
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.3s"
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums">{score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium capitalize', colorClass)}>{tier}</span>
      )}
    </div>
  )
}
