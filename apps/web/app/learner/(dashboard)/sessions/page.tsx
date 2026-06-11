import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { SessionRow } from '@/components/dashboard/learner/session-row'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { PageHeader } from '@/components/dashboard/shared/page-header'
import { faVideo } from '@fortawesome/free-solid-svg-icons'
import { mockPurchases } from '@/data/mock-purchases'

export const metadata = { title: 'My Sessions — Creonex' }

export default function SessionsPage(): React.ReactElement {
  const upcoming = mockPurchases.filter((p) => !p.completed)
  const completed = mockPurchases.filter((p) => p.completed)

  return (
    <>
      <DashboardTopbar title="My Sessions" showSearch />
      <div className="space-y-8 p-4 sm:p-6">
        <div className="space-y-3">
          <PageHeader title="Upcoming" />
          {upcoming.length === 0 ? (
            <EmptyState
              icon={faVideo}
              title="No upcoming sessions"
              description="Book a session with a creator to get started."
            />
          ) : (
            upcoming.map((p) => <SessionRow key={p.id} purchase={p} />)
          )}
        </div>

        {completed.length > 0 && (
          <div className="space-y-3">
            <PageHeader title="Completed" />
            {completed.map((p) => <SessionRow key={p.id} purchase={p} />)}
          </div>
        )}
      </div>
    </>
  )
}
