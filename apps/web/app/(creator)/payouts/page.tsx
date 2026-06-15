import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation, faCircleCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { PayoutRow } from '@/components/dashboard/creator/payout-row'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getKycStatus, getEarnings, getLedger, getPayoutHistory } from '@/dal/payouts.dal'
import { formatCurrency, cn } from '@/lib/utils'
import type { LedgerStatus } from '@creonex/types'

export const metadata = { title: 'Payouts — Creonex' }

const ledgerBadge: Record<LedgerStatus, { label: string; variant: 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  held: { label: 'Held', variant: 'secondary' },
  settled: { label: 'Paid out', variant: 'outline' },
  reversed: { label: 'Refunded', variant: 'destructive' },
}

export default async function PayoutsPage(): Promise<React.ReactElement> {
  const [kyc, earnings, ledger, history] = await Promise.all([
    getKycStatus(),
    getEarnings(),
    getLedger(),
    getPayoutHistory(),
  ])

  const verified = kyc.status === 'verified' && kyc.payoutsEnabled

  return (
    <>
      <DashboardTopbar title="Payouts" />
      <div className="p-4 sm:p-6 space-y-6">

        {/* Earnings summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard label="Available" value={formatCurrency(earnings.availablePaise / 100)} hint="Settled to you" />
          <SummaryCard label="Held" value={formatCurrency(earnings.heldPaise / 100)} hint="Clears after refund window" />
          <SummaryCard label="Pending" value={formatCurrency(earnings.pendingPaise / 100)} hint="Awaiting KYC / transfer" />
          <SummaryCard label="Lifetime earned" value={formatCurrency(earnings.lifetimeNetPaise / 100)} hint="Net of platform fee" />
        </div>

        {/* KYC gate */}
        {verified ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <FontAwesomeIcon icon={faCircleCheck} className="size-5 text-emerald-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Payouts active</p>
              <p className="text-xs text-muted-foreground">
                Settling to {kyc.account?.maskedAccount ?? 'your bank'} · {kyc.account?.bankIfsc}
              </p>
            </div>
            <Link href="/payouts/setup" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs')}>
              Update bank
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <FontAwesomeIcon icon={faTriangleExclamation} className="size-5 text-amber-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {kyc.status === 'pending' ? 'KYC under review' : 'Complete KYC to receive payouts'}
              </p>
              <p className="text-xs text-muted-foreground">
                You can keep selling — earnings are held and released to your bank once KYC + bank are verified.
              </p>
            </div>
            <Link href="/payouts/setup" className={cn(buttonVariants({ size: 'sm' }), 'text-xs shrink-0')}>
              {kyc.account ? 'View KYC' : 'Set up payouts'}
              <FontAwesomeIcon icon={faArrowRight} className="size-3 ml-1.5" />
            </Link>
          </div>
        )}

        {/* Earnings ledger */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {ledger.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No earnings yet.</p>
            ) : (
              ledger.map((e) => (
                <div key={e.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.offeringTitle ?? 'Offering'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(e.grossPaise / 100)} gross · −{formatCurrency(e.platformFeePaise / 100)} fee
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{formatCurrency(e.netPaise / 100)}</p>
                  <Badge variant={ledgerBadge[e.status].variant} className="h-5 shrink-0 px-2 text-[10px]">
                    {ledgerBadge[e.status].label}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Payout / settlement history */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payout history</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No payouts yet. Settlements to your bank will appear here.
              </p>
            ) : (
              history.map((p, i) => <PayoutRow key={p.id} payout={p} index={i} />)
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }): React.ReactElement {
  return (
    <div className="rounded-lg bg-muted/40 border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-1 tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  )
}
