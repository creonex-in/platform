'use client'

import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faClock, faCircleXmark, faSpinner, faCopy } from '@fortawesome/free-solid-svg-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PayoutItem, PayoutStatus } from '@creonex/types'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/lib/toast'

interface PayoutRowProps {
  payout: PayoutItem
  index?: number
}

const statusConfig: Record<
  PayoutStatus,
  { icon: typeof faCircleCheck; label: string; variant: 'secondary' | 'outline' | 'destructive' }
> = {
  paid: { icon: faCircleCheck, label: 'Paid', variant: 'outline' },
  processing: { icon: faSpinner, label: 'Processing', variant: 'secondary' },
  pending: { icon: faClock, label: 'Pending', variant: 'secondary' },
  failed: { icon: faCircleXmark, label: 'Failed', variant: 'destructive' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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
        <p className="text-sm font-medium">{formatCurrency(payout.amountPaise / 100)}</p>
        <p className="truncate text-xs text-muted-foreground">{formatDate(payout.createdAt)}</p>
      </div>
      {payout.utr && (
        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <span className="font-mono text-xs text-muted-foreground">{payout.utr}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => {
              navigator.clipboard.writeText(payout.utr!)
              toast.success('UTR copied')
            }}
          >
            <FontAwesomeIcon icon={faCopy} className="size-3" />
          </Button>
        </div>
      )}
      <Badge variant={conf.variant} className="h-5 shrink-0 px-2 text-[10px]">
        {conf.label}
      </Badge>
    </motion.div>
  )
}
