import { WelcomeHero } from '@/components/dashboard/shared/welcome-hero'
import { getCreatorContext } from '@/dal/users.dal'
import { getInitials, cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faShareNodes } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

export async function DashboardHero() {
  const { user, profile } = await getCreatorContext()

  const displayName = profile?.displayName ?? user?.name ?? 'Creator'
  const avatarImage = profile?.profilePhotoUrl ?? user?.image ?? null

  return (
    <WelcomeHero
      name={displayName}
      initials={getInitials(displayName)}
      image={avatarImage}
      subtitle="Here's how your creator business is doing today."
      action={
        <>
          <Link href="/offers/new" className={cn(buttonVariants({ size: 'sm' }))}>
            <FontAwesomeIcon icon={faPlus} className="mr-1 size-3.5" />
            New offer
          </Link>
          {profile?.username && (
            <Link
              href={`/top-creators/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <FontAwesomeIcon icon={faShareNodes} className="mr-1 size-3.5" />
              Share page
            </Link>
          )}
        </>
      }
    />
  )
}
