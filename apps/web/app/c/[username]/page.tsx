import { notFound } from 'next/navigation'
import TestimonialsDeck from '@/components/landing/shared/testimonials-deck'
import { creatorsService } from '@/services/creators.service'
import { isNotFound } from '@/lib/api'
import { getInitials } from '@/lib/utils'
import { ProfileHero } from './_components/profile-hero'
import { ProfileHeader } from './_components/profile-header'
import { AboutSection } from './_components/about-section'
import { OfferingsSection } from './_components/offerings-section'
import { CtaBanner } from './_components/cta-banner'
import { FaqSection } from './_components/faq-section'
import { BookSessionBar } from './_components/book-session-bar'
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

  // Group offerings by type
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

  const socialEntries = Object.entries(profile.socialLinks ?? {}).filter(
    ([, v]) => typeof v === 'string' && (v as string).length > 0,
  ) as [string, string][]

  const displayName = profile.displayName ?? `@${profile.username}`
  const initials = getInitials(profile.displayName)

  return (
    <div className="min-h-screen theme-creator bg-background text-foreground pb-20 sm:pb-0 font-sans w-full overflow-x-hidden">
      <ProfileHero coverBannerUrl={profile.coverBannerUrl} />

      <ProfileHeader
        profile={profile}
        displayName={displayName}
        initials={initials}
        socialEntries={socialEntries}
      />

      <AboutSection bio={profile.bio} tags={profile.tags} />

      <OfferingsSection
        offerings={profile.offerings}
        activeTabs={activeTabs}
        showAllTab={showAllTab}
        defaultTab={defaultTab}
      />

      {firstSession && (
        <CtaBanner offering={firstSession} displayName={displayName} />
      )}

      {profile.testimonials.length > 0 && (
        <TestimonialsDeck
          testimonials={profile.testimonials.map((t) => ({
            id: t.id,
            name: t.learnerName,
            niche: t.learnerRole ?? '',
            quote: t.content,
            initials: getInitials(t.learnerName),
          }))}
          label="Testimonials"
          heading={
            <>
              What learners say,{' '}
              <span className="text-muted-foreground">in their own words.</span>
            </>
          }
          description={`Read what students of ${displayName} have experienced.`}
        />
      )}

      <FaqSection />

      <BookSessionBar name={displayName} price={sessionPrice} />
    </div>
  )
}
