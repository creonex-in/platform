'use client'

import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons'

interface MetricCardProps {
  label: string
  value: string
  change?: number
  changeLabel?: string
  icon?: IconDefinition
  index?: number
}

export function MetricCard({ label, value, change, changeLabel, icon, index = 0 }: MetricCardProps): React.ReactElement {
  const isPositive = (change ?? 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      className="rounded-lg border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon && <FontAwesomeIcon icon={icon} className="size-3.5 text-muted-foreground" />}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {(change !== undefined || changeLabel) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {change !== undefined && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <FontAwesomeIcon
                icon={isPositive ? faArrowTrendUp : faArrowTrendDown}
                className="size-3"
              />
              {isPositive ? '+' : ''}{change}%
            </span>
          )}
          {changeLabel && <span>{changeLabel}</span>}
        </div>
      )}
    </motion.div>
  )
}
