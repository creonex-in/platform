import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { SessionRow } from '@/components/dashboard/learner/session-row'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { faBagShopping } from '@fortawesome/free-solid-svg-icons'
import { mockPurchases } from '@/data/mock-purchases'

export const metadata = { title: 'Purchases — Creonex' }

export default function PurchasesPage(): React.ReactElement {
  return (
    <>
      <DashboardTopbar title="Purchases" showSearch />
      <div className="space-y-3 p-4 sm:p-6">
        {mockPurchases.length === 0 ? (
          <EmptyState
            icon={faBagShopping}
            title="No purchases yet"
            description="Sessions, workshops, and digital products you buy will appear here."
          />
        ) : (
          mockPurchases.map((p) => <SessionRow key={p.id} purchase={p} />)
        )}
      </div>
    </>
  )
}
