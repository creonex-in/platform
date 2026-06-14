'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ReviewsTab } from './reviews-tab'
import { ProfileSidebar } from './profile-sidebar'
import { OverviewTab } from './overview-tab'
import { OfferingsSection } from './offerings-section'
import { BookSessionBar } from './book-session-bar'
import { SlotPickerModal } from './slot-picker-modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getInitials } from '@/lib/utils'
import type { PublicCreatorProfile, PublicOffering } from '@creonex/types'
import type { AvailableDate } from '@/dal/slots.dal'

interface Props {
  profile: PublicCreatorProfile
  displayName: string
  availableDates: AvailableDate[]
  sessionPrice: number | null
  activeTabs: [string, PublicOffering[]][]
  showAllTab: boolean
  defaultTab: string
}

export function ProfileContent({
  profile,
  displayName,
  availableDates,
  sessionPrice,
  activeTabs,
  showAllTab,
  defaultTab,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Modal open-state lives in the URL (?offering=…) so it survives a round-trip
  // to /checkout — Back restores the dialog with the same offering/slot/tz.
  const offeringId = searchParams.get('offering')
  const selectedOffering = offeringId
    ? (profile.offerings.find((o) => o.id === offeringId) ?? null)
    : null

  const firstBookable = profile.offerings.find(
    (o) => o.type === 'one_on_one' || o.type === 'group'
  ) ?? null

  const openModal = (offering: PublicOffering) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('offering', offering.id)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }
  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    for (const k of ['offering', 'tz', 'start', 'end']) params.delete(k)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <>
      <div className="page-container pb-24 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-6">
            <ProfileSidebar
              profile={profile}
              displayName={displayName}
              onBook={firstBookable ? () => openModal(firstBookable) : undefined}
            />
          </div>

          {/* Tabs */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-6 w-full">
            <Tabs defaultValue="overview" className="w-full">
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

              <TabsContent value="overview" className="mt-0 outline-none">
                <OverviewTab
                  profile={profile}
                  displayName={displayName}
                  availableDates={availableDates}
                  onBook={firstBookable ? () => openModal(firstBookable) : undefined}
                />
              </TabsContent>

              {profile.offerings.length > 0 && (
                <TabsContent value="offerings" className="mt-0 outline-none">
                  <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                    <OfferingsSection
                      offerings={profile.offerings}
                      activeTabs={activeTabs}
                      showAllTab={showAllTab}
                      defaultTab={defaultTab}
                      onBook={openModal}
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
                        : 'Thousands of learners across India use Creonex to upskill, switch careers, and grow.'}
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

      {/* Mobile sticky bar */}
      <BookSessionBar
        name={displayName}
        price={sessionPrice}
        onBook={firstBookable ? () => openModal(firstBookable) : undefined}
      />

      {/* Booking modal */}
      {selectedOffering && (
        <SlotPickerModal
          offering={selectedOffering}
          profile={profile}
          onClose={closeModal}
        />
      )}
    </>
  )
}
