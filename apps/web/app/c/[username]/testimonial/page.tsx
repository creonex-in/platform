import MarketingShell from '@/components/layout/marketing-shell'
import { creatorsService } from '@/services/creators.service'
import { getInitials } from '@/lib/utils'
import { TestimonialForm } from './_components/testimonial-form'

export default async function TestimonialSubmitPage({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<React.ReactElement> {
  const { username } = await params

  let displayName = `@${username}`
  let profilePhotoUrl: string | null = null

  try {
    const profile = await creatorsService.getPublicProfile(username)
    displayName = profile.displayName ?? `@${profile.username}`
    profilePhotoUrl = profile.profilePhotoUrl ?? null
  } catch {
    // Profile might not be live yet or API is unavailable — still show the form.
    // The submission endpoint validates the creator independently.
  }

  return (
    <MarketingShell>
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
        style={{
          background:
            'radial-gradient(ellipse at top, oklch(0.55 0.18 255 / 0.07) 0%, transparent 65%)',
        }}
      >
        <div className="w-full max-w-[480px] space-y-6">
          {/* Creator hero */}
          <div className="text-center space-y-3">
            <div
              className="mx-auto size-14 rounded-full flex items-center justify-center text-lg font-bold text-white ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
              style={{ background: 'oklch(0.55 0.18 255)' }}
            >
              {profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePhotoUrl}
                  alt={displayName}
                  className="size-14 rounded-full object-cover"
                />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-foreground">{displayName}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Share your honest experience
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-card/90 shadow-xl backdrop-blur-sm p-6">
            <TestimonialForm username={username} creatorName={displayName} />
          </div>
        </div>
      </div>
    </MarketingShell>
  )
}
