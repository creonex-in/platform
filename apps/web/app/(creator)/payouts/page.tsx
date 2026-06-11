import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { PayoutRow } from '@/components/dashboard/creator/payout-row'
import { InsightBox } from '@/components/dashboard/creator/insight-box'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockPayouts, payoutSummary } from '@/data/mock-payouts'
import { formatCurrency } from '@/lib/utils'

export const metadata = { title: 'Payouts — Creonex' }

export default function PayoutsPage(): React.ReactElement {
  return (
    <>
      <DashboardTopbar title="Payouts" />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/40 border border-border p-4">
            <p className="text-xs text-muted-foreground">Pending payout</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(payoutSummary.pendingAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">Releases {payoutSummary.pendingRelease}</p>
          </div>
          <div className="rounded-lg bg-muted/40 border border-border p-4">
            <p className="text-xs text-muted-foreground">This month</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(payoutSummary.thisMonth)}</p>
          </div>
          <div className="rounded-lg bg-muted/40 border border-border p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground">All time earned</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(payoutSummary.totalEarned)}</p>
          </div>
        </div>

        {!payoutSummary.kycVerified && (
          <InsightBox
            message="Complete KYC to enable automatic weekly payouts. Unverified accounts can only withdraw manually."
            type="warning"
            actionLabel="Verify now →"
          />
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Pending payout</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(payoutSummary.pendingAmount)} releases {payoutSummary.pendingRelease}</p>
          </div>
          <Button size="sm" className="h-8 text-xs">Withdraw now</Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payout history</CardTitle>
          </CardHeader>
          <CardContent>
            {mockPayouts.map((payout, i) => (
              <PayoutRow key={payout.id} payout={payout} index={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
