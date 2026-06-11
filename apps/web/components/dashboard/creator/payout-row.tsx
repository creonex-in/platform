'use client'

import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faClock, faCircleXmark, faCopy } from '@fortawesome/free-solid-svg-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Payout } from '@/types/payout'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface PayoutRowProps {
  payout: Payout
  index?: number
}

const statusConfig: Record<
  Payout['status'],
  { icon: typeof faCircleCheck; label: string; variant: 'secondary' | 'outline' | 'destructive' }
> = {
  paid: { icon: faCircleCheck, label: 'Paid', variant: 'outline' },
  pending: { icon: faClock, label: 'Pending', variant: 'secondary' },
  held: { icon: faCircleXmark, label: 'Held', variant: 'destructive' },
}

export function PayoutRow({ payout, index = 0 }: PayoutRowProps): React.ReactElement {
  const conf = statusConfig[payout.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex items-center gap-3 border-b border-border py-3 last:border-0"
    >
      <FontAwesomeIcon icon={conf.icon} className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{formatCurrency(payout.amount)}</p>
        <p className="truncate text-xs text-muted-foreground">
          {payout.date} · {payout.type === 'weekly-auto' ? 'Auto transfer' : 'Manual transfer'}
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
        <span className="font-mono text-xs text-muted-foreground">{payout.transactionId}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => {
            navigator.clipboard.writeText(payout.transactionId)
            toast.success('Transaction ID copied')
          }}
        >
          <FontAwesomeIcon icon={faCopy} className="size-3" />
        </Button>
      </div>
      <Badge variant={conf.variant} className="h-5 shrink-0 px-2 text-[10px]">
        {conf.label}
      </Badge>
    </motion.div>
  )
}
