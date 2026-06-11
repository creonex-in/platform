'use client'

import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Collaboration } from '@/data/mock-collab'
import { formatCurrency } from '@/lib/utils'

const statusConfig: Record<Collaboration['status'], { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  active: { label: 'Active', variant: 'default' },
  pending: { label: 'Pending', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'outline' },
  incoming: { label: 'Invite', variant: 'secondary' },
}

interface CollabCardProps {
  collab: Collaboration
  index?: number
}

export function CollabCard({ collab, index = 0 }: CollabCardProps): React.ReactElement {
  const statusConf = statusConfig[collab.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 6) * 0.04 }}
      className="rounded-lg border border-border bg-card p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-muted text-xs font-medium">
              {collab.partnerInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{collab.partnerName}</p>
            <p className="text-xs text-muted-foreground">{collab.partnerNiche}</p>
          </div>
        </div>
        <Badge variant={statusConf.variant} className="h-5 shrink-0 px-2 text-[10px]">
          {statusConf.label}
        </Badge>
      </div>

      <div>
        <p className="text-sm font-medium">{collab.workshopTitle}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{collab.date}</p>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <p className="text-muted-foreground">Split</p>
          <p className="font-medium">{collab.mySplit}% / {collab.partnerSplit}%</p>
        </div>
        <div className="space-y-0.5 text-right">
          <p className="text-muted-foreground">{collab.registrations} registered</p>
          {collab.projectedRevenue > 0 && (
            <p className="font-medium text-foreground">
              {formatCurrency(collab.projectedRevenue)} projected
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
