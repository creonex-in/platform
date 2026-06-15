import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { getKycStatus } from '@/dal/payouts.dal'
import { KycForm } from './_components/kyc-form'

export const metadata = { title: 'Payout setup — Creonex' }

export default async function PayoutSetupPage(): Promise<React.ReactElement> {
  const kyc = await getKycStatus()

  return (
    <>
      <DashboardTopbar title="Payout setup" />
      <div className="p-4 sm:p-6">
        <div className="mb-6 max-w-xl">
          <h2 className="text-lg font-bold text-foreground">KYC & bank details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add your KYC and bank account so we can settle your earnings. You can keep selling
            meanwhile — funds are held until verification completes.
          </p>
        </div>
        <KycForm initial={kyc} />
      </div>
    </>
  )
}
