import { notFound } from 'next/navigation'
import { creatorsService } from '@/services/creators.service'
import { isNotFound } from '@/lib/api'
import { ProfileHero } from './_components/profile-hero'
import { ProfileContent } from './_components/profile-content'
import { getCreatorAvailabilityDates } from '@/dal/slots.dal'
import { CreatorProfileFooter } from '@/components/layout/creator-profile-footer'
import type { PublicCreatorProfile, PublicOffering } from '@creonex/types'

export default async function CreatorProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ preview?: string }>
}): Promise<React.ReactElement> {
  const { username } = await params
  // `?preview=1` renders the page read-only (booking disabled) for the creator's
  // own profile-editor live preview iframe.
  const preview = (await searchParams).preview === '1'

  let profile: PublicCreatorProfile
  try {
    profile = await creatorsService.getPublicProfile(username)
  } catch (e) {
    if (isNotFound(e)) notFound()
    throw e
  }

  const availableDates = await getCreatorAvailabilityDates(profile)

  const grouped = new Map<string, PublicOffering[]>()
  for (const o of profile.offerings) {
    if (!grouped.has(o.type)) grouped.set(o.type, [])
    grouped.get(o.type)!.push(o)
  }
  const activeTabs = [...grouped.entries()].filter(([, items]) => items.length > 0)
  const showAllTab = activeTabs.length > 1
  const defaultTab = showAllTab ? 'all' : (activeTabs[0]?.[0] ?? 'all')

  const firstSession = profile.offerings.find((o) => o.type === 'one_on_one')
  const sessionPrice = firstSession?.price ?? null

  const displayName = profile.displayName ?? `@${profile.username}`

  const content = (
    <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-0 font-sans w-full">
      <ProfileHero
        coverBannerUrl={profile.coverBannerUrl}
        username={profile.username}
        displayName={displayName}
        isVerified={profile.isVerified}
        qualityTier={profile.qualityTier}
        socialLinks={profile.socialLinks}
        nextSlot={availableDates[0] ?? null}
        preview={preview}
      />
      <ProfileContent
        profile={profile}
        displayName={displayName}
        availableDates={availableDates}
        sessionPrice={sessionPrice}
        activeTabs={activeTabs}
        showAllTab={showAllTab}
        defaultTab={defaultTab}
        preview={preview}
      />
    </div>
  )

  // Preview iframe (creator's own editor) drops the site navbar/footer chrome.
  return preview ? content : (
    <>
      {content}
      <CreatorProfileFooter />
    </>
  )
}
