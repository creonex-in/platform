'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export interface QuickAction {
  label: string
  description: string
  icon: IconDefinition
  href?: string
  onClick?: () => void
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {actions.map((a, i) => {
        const inner = (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="group flex h-full items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <FontAwesomeIcon icon={a.icon} className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{a.label}</p>
              <p className="truncate text-xs text-muted-foreground">{a.description}</p>
            </div>
          </motion.div>
        )

        return a.href ? (
          <Link key={a.label} href={a.href} className="cursor-pointer">
            {inner}
          </Link>
        ) : (
          <button key={a.label} onClick={a.onClick} className="cursor-pointer text-left">
            {inner}
          </button>
        )
      })}
    </div>
  )
}
