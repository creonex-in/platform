import type { Metadata } from 'next'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { ResourceRow } from '@/components/dashboard/learner/resource-row'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { getLearnerDownloads } from '@/dal/learner.dal'

export const metadata: Metadata = { title: 'Downloads — Creonex' }

export default async function DownloadsPage(): Promise<React.ReactElement> {
  const downloaded = await getLearnerDownloads()

  return (
    <>
      <DashboardTopbar title="Downloads" showSearch />
      <div className="space-y-4 p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">
          Files you&apos;ve downloaded. Available offline anytime.
        </p>
        {downloaded.length === 0 ? (
          <EmptyState
            icon={faDownload}
            title="No downloads yet"
            description="Resources you download will appear here."
          />
        ) : (
          <div className="space-y-2">
            {downloaded.map((r, i) => (
              <ResourceRow key={r.id} resource={r} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
