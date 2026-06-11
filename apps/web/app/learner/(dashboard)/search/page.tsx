import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { SearchView } from '@/components/dashboard/learner/search-view'
import { getLearnerExperts } from '@/dal/learner.dal'

export const metadata: Metadata = { title: '1:1 Experts — Creonex' }

export default async function SearchPage(): Promise<React.ReactElement> {
  const experts = await getLearnerExperts()

  return (
    <>
      <DashboardTopbar title="1:1 Experts" />
      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
        <SearchView experts={experts} />
      </Suspense>
    </>
  )
}
