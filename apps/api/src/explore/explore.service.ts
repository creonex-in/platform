import { Injectable } from '@nestjs/common'
import {
  NICHES,
  type BrowseOfferingsResponse, type ExploreItem, type LiveEventFormat, type Niche,
  type OfferType,
} from '@creonex/types'
import { LearnerProfileRepository } from '../users/learner-profile.repository'
import { ExploreRepository, type ExploreRow } from './explore.repository'
import type { BrowseOfferingsQueryDto } from './explore.query.dto'

const RECOMMENDED_LIMIT = 12

@Injectable()
export class ExploreService {
  constructor(
    private readonly repo: ExploreRepository,
    private readonly learnerRepo: LearnerProfileRepository,
  ) {}

  async browse(query: BrowseOfferingsQueryDto): Promise<BrowseOfferingsResponse> {
    const type = query.type ?? 'all'
    const niche = query.niche ?? 'all'
    const sort = query.sort ?? 'relevance'
    const limit = query.limit ?? 24
    const offset = query.offset ?? 0
    const q = query.q?.trim()

    const { rows, total } = await this.repo.browse({
      type,
      niche,
      sort,
      limit,
      offset,
      q: q && q.length >= 2 ? q : undefined,
    })

    return { items: rows.map(toExploreItem), total, limit, offset }
  }

  /** Personalized rail — offerings in the learner's interested niches. Empty if no interests. */
  async recommended(userId: string): Promise<BrowseOfferingsResponse> {
    const profile = await this.learnerRepo.findByUserId(userId)
    const niches = (profile?.interestedNiches ?? []).filter(isNiche)
    const rows = await this.repo.browseByNiches(niches, RECOMMENDED_LIMIT)
    return { items: rows.map(toExploreItem), total: rows.length, limit: RECOMMENDED_LIMIT, offset: 0 }
  }
}

function isNiche(value: string): value is Niche {
  return (NICHES as readonly string[]).includes(value)
}

/** Map a flat join row to the public ExploreItem (paise→INR, metadata.format only). */
function toExploreItem(r: ExploreRow): ExploreItem {
  return {
    id: r.id,
    type: r.type as OfferType,
    title: r.title,
    description: r.description ?? null,
    price: Math.round(r.price / 100),
    currency: r.currency,
    durationMinutes: r.durationMinutes ?? null,
    scheduledAt: r.scheduledAt ? r.scheduledAt.toISOString() : null,
    seatsTotal: r.seatsTotal ?? null,
    seatsRemaining: r.seatsRemaining ?? null,
    totalBookings: r.totalBookings,
    thumbnailUrl: r.thumbnailUrl ?? null,
    slug: r.slug ?? null,
    format: (r.metadata as { format?: LiveEventFormat } | null)?.format ?? null,
    creator: {
      username: r.creatorUsername ?? '',
      displayName: r.creatorDisplayName ?? null,
      profilePhotoUrl: r.creatorPhotoUrl ?? null,
      primaryNiche: (r.creatorNiche as Niche | null) ?? null,
      rating: Number(r.creatorRating ?? 0),
      reviewCount: r.creatorReviews ?? 0,
      isVerified: r.creatorVerified ?? false,
    },
  }
}
