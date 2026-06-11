import type { Metadata } from 'next'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { WorkshopsView } from '@/components/dashboard/learner/workshops-view'
import { getLearnerWorkshops } from '@/dal/learner.dal'

export const metadata: Metadata = { title: 'Workshops — Creonex' }

export default async function WorkshopsPage(): Promise<React.ReactElement> {
  const { offers, creators } = await getLearnerWorkshops()

  return (
    <>
      <DashboardTopbar title="Workshops" showSearch />
      <WorkshopsView offers={offers} creators={creators} />
    </>
  )
}
