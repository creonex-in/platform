'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface FilterChip {
  label: string
  value: string
}

interface FilterChipGroupProps {
  chips: FilterChip[]
  value: string
  onChange: (value: string) => void
}

export function FilterChipGroup({ chips, value, onChange }: FilterChipGroupProps): React.ReactElement {
  return (
    <div className="flex gap-2 flex-wrap">
      {chips.map((chip) => (
        <motion.button
          key={chip.value}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(chip.value)}
          className={cn(
            'cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors',
            value === chip.value
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
          )}
        >
          {chip.label}
        </motion.button>
      ))}
    </div>
  )
}
