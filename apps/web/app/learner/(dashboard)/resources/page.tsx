import type { Metadata } from 'next'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { ResourcesView } from '@/components/dashboard/learner/resources-view'
import { getLearnerResources } from '@/dal/learner.dal'

export const metadata: Metadata = { title: 'Resources — Creonex' }

export default async function ResourcesPage(): Promise<React.ReactElement> {
  const { resources, categories, continueLearning } = await getLearnerResources()

  return (
    <>
      <DashboardTopbar title="Resources" showSearch />
      <ResourcesView resources={resources} categories={categories} continueLearning={continueLearning} />
    </>
  )
}
