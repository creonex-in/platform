import { notFound } from 'next/navigation'
import { creatorsService } from '@/services/creators.service'
import { isNotFound } from '@/lib/api'
import { ProfileHero } from './_components/profile-hero'
import { ProfileContent } from './_components/profile-content'
import { getCreatorAvailabilityDates } from '@/dal/slots.dal'
import MarketingShell from '@/components/layout/marketing-shell'
import type { PublicCreatorProfile, PublicOffering } from '@creonex/types'

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<React.ReactElement> {
  const { username } = await params

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

  return (
    <MarketingShell>
      <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-0 font-sans w-full">
        <ProfileHero
          coverBannerUrl={profile.coverBannerUrl}
          username={profile.username}
          displayName={displayName}
        />
        <ProfileContent
          profile={profile}
          displayName={displayName}
          availableDates={availableDates}
          sessionPrice={sessionPrice}
          activeTabs={activeTabs}
          showAllTab={showAllTab}
          defaultTab={defaultTab}
        />
      </div>
    </MarketingShell>
  )
}
