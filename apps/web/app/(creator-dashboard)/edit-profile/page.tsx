import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/shared/dashboard-shell'
import { EditProfileForm } from '@/components/dashboard/creator/profile/edit-profile-form'
import { getCreatorContext } from '@/dal/users.dal'

export const metadata: Metadata = { title: 'Edit Profile — Creonex' }

export default async function CreatorEditProfilePage(): Promise<React.ReactElement> {
  const { profile } = await getCreatorContext()
  // The (creator) layout already gates on a live profile; this is a safety net.
  if (!profile) redirect('/onboarding/creator/step-1')

  return (
    <DashboardShell title="Edit Profile" noPadding>
      <EditProfileForm profile={profile} />
    </DashboardShell>
  )
}
