'use client'

import { useTransition } from 'react'
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
  /** Read-only preview (creator's own editor iframe): booking disabled. */
  preview?: boolean
}

export function ProfileContent({
  profile,
  displayName,
  availableDates,
  sessionPrice,
  activeTabs,
  showAllTab,
  defaultTab,
  preview = false,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Opening/closing the dialog are URL navigations (server round-trip). Wrapping
  // them in a transition gives `isPending` so we can show loading feedback.
  const [isPending, startTransition] = useTransition()

  // Modal open-state lives in the URL (?offering=…) so it survives a round-trip
  // to /checkout — Back restores the dialog with the same offering/slot/tz.
  const offeringId = searchParams.get('offering')
  const selectedOffering = offeringId
    ? (profile.offerings.find((o) => o.id === offeringId) ?? null)
    : null

  // During a pending open the param isn't committed yet (selectedOffering still
  // null); during a pending close it's still set — so the two are distinguishable.
  const opening = isPending && !selectedOffering
  const closing = isPending && !!selectedOffering

  const firstBookable = profile.offerings.find(
    (o) => o.type === 'one_on_one' || o.type === 'group'
  ) ?? null

  const openModal = (offering: PublicOffering) => {
    if (preview) return // booking disabled in the editor preview
    const params = new URLSearchParams(searchParams.toString())
    params.set('offering', offering.id)
    startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }))
  }

  // Route each offering to the right flow: 1:1 (and legacy group) pick a slot here;
  // live events + digital products have no slot, so go straight to checkout.
  const handleOffer = (offering: PublicOffering) => {
    if (preview) return
    if (offering.type === 'live_event' || offering.type === 'digital') {
      startTransition(() =>
        router.push(`/checkout?creator=${profile.username}&offering=${offering.id}`),
      )
      return
    }
    openModal(offering)
  }
  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    for (const k of ['offering', 'tz', 'start', 'end']) params.delete(k)
    const qs = params.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
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
              preview={preview}
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
                      onBook={handleOffer}
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
                        : preview
                          ? 'Reviews from your learners will appear here.'
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
                      isVerified: t.isVerified,
                    }))}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </div>

      {/* Mobile sticky bar — hidden in read-only preview */}
      {!preview && (
        <BookSessionBar
          name={displayName}
          price={sessionPrice}
          onBook={firstBookable ? () => openModal(firstBookable) : undefined}
        />
      )}

      {/* Opening — the dialog is a navigation, so bridge the round-trip with a
          backdrop + spinner that visually flows into the dialog. */}
      {!preview && opening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-card/90 px-6 py-5 shadow-xl ring-1 ring-foreground/10">
            <span className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <span className="text-xs font-semibold text-muted-foreground">Opening booking…</span>
          </div>
        </div>
      )}

      {/* Booking modal — never mounts in read-only preview */}
      {!preview && selectedOffering && (
        <SlotPickerModal
          offering={selectedOffering}
          profile={profile}
          onClose={closeModal}
          closing={closing}
        />
      )}
    </>
  )
}
