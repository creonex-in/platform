'use client'

import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf, faPlay, faTableCells, faBook, faCode } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { ResourceType } from '@/types/resource'
import { cn } from '@/lib/utils'

const typeIcon: Record<ResourceType, IconDefinition> = {
  pdf: faFilePdf,
  video: faPlay,
  template: faTableCells,
  guide: faBook,
  cheatsheet: faCode,
}

interface ResourceCategoryCardProps {
  type: ResourceType
  label: string
  count: number
  active?: boolean
  index?: number
  onClick?: () => void
}

export function ResourceCategoryCard({
  type,
  label,
  count,
  active = false,
  index = 0,
  onClick,
}: ResourceCategoryCardProps): React.ReactElement {
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 6) * 0.04 }}
      onClick={onClick}
      className={cn(
        'flex cursor-pointer flex-col items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors',
        active ? 'border-primary ring-1 ring-primary' : 'border-border hover:bg-muted/50'
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <FontAwesomeIcon icon={typeIcon[type]} className="size-4" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{count} resources</p>
      </div>
    </motion.button>
  )
}
