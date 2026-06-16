import { CreatorProfileNav } from '@/components/layout/creator-profile-nav'
import { CreatorProfileFooter } from '@/components/layout/creator-profile-footer'

interface CreatorProfileShellProps {
  username: string
  displayName: string
  primaryNiche: string | null
  profilePhotoUrl: string | null
  children: React.ReactNode
}

export function CreatorProfileShell({
  username,
  displayName,
  primaryNiche,
  profilePhotoUrl,
  children,
}: CreatorProfileShellProps): React.ReactElement {
  return (
    <>
      <CreatorProfileNav
        username={username}
        displayName={displayName}
        primaryNiche={primaryNiche}
        profilePhotoUrl={profilePhotoUrl}
      />
      {children}
      <CreatorProfileFooter />
    </>
  )
}
