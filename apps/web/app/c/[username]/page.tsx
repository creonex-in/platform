import { notFound } from 'next/navigation'
import { ReviewsTab } from './_components/reviews-tab'
import { creatorsService } from '@/services/creators.service'
import { isNotFound } from '@/lib/api'
import { getInitials } from '@/lib/utils'
import { ProfileHero } from './_components/profile-hero'
import { ProfileSidebar } from './_components/profile-sidebar'
import { OverviewTab } from './_components/overview-tab'
import { OfferingsSection } from './_components/offerings-section'
import { FaqSection } from './_components/faq-section'
import { BookSessionBar } from './_components/book-session-bar'
import MarketingShell from '@/components/layout/marketing-shell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  const displayName = profile.displayName ?? `@${profile.username}`

  return (
    <MarketingShell>
      <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-0 font-sans w-full overflow-x-hidden">
        {/* Cover Banner */}
        <ProfileHero
          coverBannerUrl={profile.coverBannerUrl}
          username={profile.username}
          displayName={displayName}
        />

        {/* Content Layout */}
        <div className="page-container pb-24 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column: Sidebar Profile Card */}
            <div className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-6">
              <ProfileSidebar profile={profile} displayName={displayName} />
            </div>

            {/* Right Column: Dynamic Tabs & Content */}
            <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-6 w-full">
              <Tabs defaultValue="overview" className="w-full">
                {/* Custom UNDERLINED styled tab navigation header */}
                <div className="overflow-x-auto scrollbar-hide border-b border-border/80 mb-8">
                  <TabsList className="flex justify-start bg-transparent h-auto p-0 gap-6 rounded-none w-fit">
                    <TabsTrigger
                      value="overview"
                      className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-3 text-sm font-bold text-muted-foreground data-[state=active]:text-foreground bg-transparent shadow-none transition-all cursor-pointer whitespace-nowrap"
                    >
                      Overview
                    </TabsTrigger>
                    
                    {profile.offerings.length > 0 && (
                      <TabsTrigger
                        value="offerings"
                        className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-3 text-sm font-bold text-muted-foreground data-[state=active]:text-foreground bg-transparent shadow-none transition-all cursor-pointer whitespace-nowrap"
                      >
                        Offerings ({profile.offerings.length})
                      </TabsTrigger>
                    )}

                    <TabsTrigger
                      value="reviews"
                      className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 py-3 text-sm font-bold text-muted-foreground data-[state=active]:text-foreground bg-transparent shadow-none transition-all cursor-pointer whitespace-nowrap"
                    >
                      Reviews ({profile.testimonials.length})
                    </TabsTrigger>


                  </TabsList>
                </div>

                {/* Tab content panels */}
                <TabsContent value="overview" className="mt-0 outline-none">
                  <OverviewTab profile={profile} displayName={displayName} />
                </TabsContent>

                {profile.offerings.length > 0 && (
                  <TabsContent value="offerings" className="mt-0 outline-none">
                    <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                      <OfferingsSection
                        offerings={profile.offerings}
                        activeTabs={activeTabs}
                        showAllTab={showAllTab}
                        defaultTab={defaultTab}
                      />
                    </div>
                  </TabsContent>
                )}

                <TabsContent value="reviews" className="mt-0 outline-none">
                  <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-foreground font-display">
                        Reviews for {displayName}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium mt-0.5">
                        {profile.testimonials.length > 0
                          ? `Read what students of ${displayName} have experienced.`
                          : `${displayName} hasn't received any reviews yet.`}
                      </p>
                    </div>
                    <ReviewsTab
                      testimonials={profile.testimonials.map((t) => ({
                        id: t.id,
                        name: t.learnerName,
                        niche: t.learnerRole ?? '',
                        quote: t.content,
                        initials: getInitials(t.learnerName),
                      }))}
                    />
                  </div>
                </TabsContent>


              </Tabs>
            </div>

          </div>
        </div>

        {/* Mobile quick-book sticky bar */}
        <BookSessionBar name={displayName} price={sessionPrice} />
      </div>
    </MarketingShell>
  )
}
