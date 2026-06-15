import MarketingShell from '@/components/layout/marketing-shell'
import { creatorsService } from '@/services/creators.service'
import { getInitials } from '@/lib/utils'
import { TestimonialForm } from './_components/testimonial-form'

function formatNiche(niche: string | null): string | null {
  if (!niche) return null
  return niche
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default async function TestimonialSubmitPage({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<React.ReactElement> {
  const { username } = await params

  let displayName = `@${username}`
  let profilePhotoUrl: string | null = null
  let niche: string | null = null
  let avgRating = 0
  let totalReviews = 0
  let totalSessions = 0

  try {
    const profile = await creatorsService.getPublicProfile(username)
    displayName = profile.displayName ?? `@${profile.username}`
    profilePhotoUrl = profile.profilePhotoUrl ?? null
    niche = formatNiche(profile.primaryNiche)
    avgRating = parseFloat(profile.smoothedRating) || 0
    totalReviews = profile.totalReviews ?? 0
    totalSessions = profile.totalSessions ?? 0
  } catch {
    // Profile might not be live yet or API is unavailable — still show the form.
    // The submission endpoint validates the creator independently.
  }

  return (
    <MarketingShell>
      <div
        className="relative min-h-dvh px-4 py-12 sm:py-16"
        style={{
          background:
            'radial-gradient(120% 80% at 50% -10%, oklch(0.55 0.18 255 / 0.10) 0%, transparent 55%)',
        }}
      >
        <div className="mx-auto w-full max-w-5xl">
          <TestimonialForm
            username={username}
            creatorName={displayName}
            profilePhotoUrl={profilePhotoUrl}
            initials={getInitials(displayName)}
            niche={niche}
            avgRating={avgRating}
            totalReviews={totalReviews}
            totalSessions={totalSessions}
          />
        </div>
      </div>
    </MarketingShell>
  )
}
