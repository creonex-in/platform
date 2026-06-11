import type { Metadata } from 'next'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { ProfileEditor } from '@/components/dashboard/creator/profile/profile-editor'
import { mockCreators } from '@/data/mock-creators'

export const metadata: Metadata = { title: 'Edit Profile — Creonex' }

export default function CreatorEditProfilePage(): React.ReactElement {
  const creator = mockCreators[0]

  return (
    <>
      <DashboardTopbar title="Edit Profile" />
      <ProfileEditor creator={creator} />
    </>
  )
}
