import type { Metadata } from 'next'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { ResourceRow } from '@/components/dashboard/learner/resource-row'
import { CreatorCard } from '@/components/dashboard/learner/creator-card'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { faBookmark } from '@fortawesome/free-solid-svg-icons'
import { getLearnerBookmarks } from '@/dal/learner.dal'

export const metadata: Metadata = { title: 'Bookmarks — Creonex' }

export default async function BookmarksPage(): Promise<React.ReactElement> {
  const { resources, experts } = await getLearnerBookmarks()

  return (
    <>
      <DashboardTopbar title="Bookmarks" showSearch />
      <div className="space-y-8 p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">Everything you&apos;ve saved for later.</p>

        <section className="space-y-3">
          <h3 className="text-sm font-medium">Saved resources</h3>
          {resources.length === 0 ? (
            <EmptyState
              icon={faBookmark}
              title="No bookmarks yet"
              description="Bookmark resources to find them here."
            />
          ) : (
            <div className="space-y-2">
              {resources.map((r, i) => (
                <ResourceRow key={r.id} resource={r} index={i} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium">Saved experts</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((c, i) => (
              <CreatorCard key={c.id} creator={c} index={i} />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
