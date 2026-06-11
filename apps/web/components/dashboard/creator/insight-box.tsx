'use client'

import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'

interface InsightBoxProps {
  message: string
  type?: 'warning' | 'info' | 'success'
  actionLabel?: string
  onAction?: () => void
}

export function InsightBox({ message, actionLabel, onAction }: InsightBoxProps): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3"
    >
      <FontAwesomeIcon icon={faLightbulb} className="mt-0.5 size-4 shrink-0 text-primary" />
      <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{message}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="shrink-0 text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}
