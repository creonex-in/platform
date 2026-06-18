import type { ExploreItem } from '@creonex/types'
import { nicheLabel } from '@/lib/niche'
import { SessionCard } from './session-card'
import { DigitalAssetCard } from './digital-asset-card'
import { LiveWorkshopCard } from './live-workshop-card'

/** Absolute, cache-stable label for a live event (no relative "in 2h" — would go stale under ISR). */
function liveLabel(scheduledAt: string | null): string {
  if (!scheduledAt) return 'Live session'
  const when = new Date(scheduledAt)
  if (when.getTime() <= Date.now()) return 'Happening now'
  return `Starts ${when.toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  })}`
}

/** Maps a single ExploreItem to its themed card. Server component — no client JS. */
export function ExploreCard({ item, className }: { item: ExploreItem; className?: string }) {
  const href = `/c/${item.creator.username}`
  const creator = {
    name: item.creator.displayName ?? item.creator.username,
    username: item.creator.username,
    title: nicheLabel(item.creator.primaryNiche),
    avatarUrl: item.creator.profilePhotoUrl,
  }

  if (item.type === 'digital') {
    return (
      <DigitalAssetCard
        id={item.id}
        creator={creator}
        bio={item.description ?? ''}
        assetName={item.title}
        assetType="Digital Download"
        price={item.price}
        href={href}
        className={className}
      />
    )
  }

  if (item.type === 'live_event') {
    const seatsTotal = item.seatsTotal ?? 0
    const seatsFilled = Math.max(0, seatsTotal - (item.seatsRemaining ?? seatsTotal))
    return (
      <LiveWorkshopCard
        id={item.id}
        creator={creator}
        title={item.title}
        seatsFilled={seatsFilled}
        seatsTotal={seatsTotal || 1}
        price={item.price}
        startsInLabel={liveLabel(item.scheduledAt)}
        href={href}
        className={className}
      />
    )
  }

  // one_on_one
  return (
    <SessionCard
      id={item.id}
      variant="1on1"
      creator={creator}
      bio={item.description ?? ''}
      rating={item.creator.rating}
      reviewCount={item.creator.reviewCount}
      sessionLabel={item.title}
      pricePerSlot={item.price}
      durationMinutes={item.durationMinutes ?? 0}
      totalPrice={item.price}
      href={href}
      className={className}
    />
  )
}
