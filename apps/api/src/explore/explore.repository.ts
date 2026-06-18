import { Inject, Injectable } from '@nestjs/common'
import { and, asc, count, desc, eq, ilike, inArray, or, type SQL } from 'drizzle-orm'
import type { ExploreSort, Niche, OfferType } from '@creonex/types'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { creatorProfiles, offerings } from '../database/schema'

export interface BrowseArgs {
  type: 'all' | OfferType
  niche: 'all' | Niche
  q?: string
  sort: ExploreSort
  limit: number
  offset: number
}

/** The flat row shape returned by the join — offering columns + denormalized creator. */
const SELECTION = {
  id: offerings.id,
  type: offerings.type,
  title: offerings.title,
  description: offerings.description,
  price: offerings.price,
  currency: offerings.currency,
  durationMinutes: offerings.durationMinutes,
  scheduledAt: offerings.scheduledAt,
  seatsTotal: offerings.seatsTotal,
  seatsRemaining: offerings.seatsRemaining,
  totalBookings: offerings.totalBookings,
  thumbnailUrl: offerings.thumbnailUrl,
  slug: offerings.slug,
  metadata: offerings.metadata,
  createdAt: offerings.createdAt,
  creatorUsername: creatorProfiles.username,
  creatorDisplayName: creatorProfiles.displayName,
  creatorPhotoUrl: creatorProfiles.profilePhotoUrl,
  creatorNiche: creatorProfiles.primaryNiche,
  creatorRating: creatorProfiles.smoothedRating,
  creatorReviews: creatorProfiles.totalReviews,
  creatorVerified: creatorProfiles.isVerified,
} as const

export type ExploreRow = Awaited<ReturnType<ExploreRepository['browse']>>['rows'][number]

@Injectable()
export class ExploreRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  /** Only ever surface live offerings from publicly-visible creators. */
  private baseConditions(): SQL[] {
    return [eq(offerings.status, 'live'), eq(creatorProfiles.isLive, true)]
  }

  private orderFor(sort: ExploreSort): SQL[] {
    switch (sort) {
      case 'price_asc':
        return [asc(offerings.price)]
      case 'price_desc':
        return [desc(offerings.price)]
      case 'newest':
        return [desc(offerings.createdAt)]
      case 'top_rated':
        return [desc(creatorProfiles.smoothedRating), desc(creatorProfiles.qualityScore)]
      case 'relevance':
      default:
        // boosted creators first, then quality, then rating, then recency (stable tiebreak)
        return [
          desc(creatorProfiles.inDiscoveryBoost),
          desc(creatorProfiles.qualityScore),
          desc(creatorProfiles.smoothedRating),
          desc(offerings.createdAt),
        ]
    }
  }

  /** Generic browse/search — returns the page rows + the total count for that filter. */
  async browse(args: BrowseArgs) {
    const where = and(...this.whereFor(args))

    const rows = await this.db
      .select(SELECTION)
      .from(offerings)
      .innerJoin(creatorProfiles, eq(offerings.creatorProfileId, creatorProfiles.id))
      .where(where)
      .orderBy(...this.orderFor(args.sort))
      .limit(args.limit)
      .offset(args.offset)

    const [totalRow] = await this.db
      .select({ value: count() })
      .from(offerings)
      .innerJoin(creatorProfiles, eq(offerings.creatorProfileId, creatorProfiles.id))
      .where(where)

    return { rows, total: Number(totalRow?.value ?? 0) }
  }

  /** Offerings whose creator's primary niche is in the learner's interests, quality-ranked. */
  async browseByNiches(niches: Niche[], limit: number) {
    if (niches.length === 0) return []
    return this.db
      .select(SELECTION)
      .from(offerings)
      .innerJoin(creatorProfiles, eq(offerings.creatorProfileId, creatorProfiles.id))
      .where(
        and(
          ...this.baseConditions(),
          inArray(creatorProfiles.primaryNiche, niches),
        ),
      )
      .orderBy(
        desc(creatorProfiles.inDiscoveryBoost),
        desc(creatorProfiles.qualityScore),
        desc(creatorProfiles.smoothedRating),
      )
      .limit(limit)
  }

  private whereFor(args: BrowseArgs): SQL[] {
    const conds = this.baseConditions()
    if (args.type !== 'all') conds.push(eq(offerings.type, args.type))
    if (args.niche !== 'all') conds.push(eq(creatorProfiles.primaryNiche, args.niche))
    if (args.q) {
      const like = `%${args.q}%`
      const match = or(
        ilike(offerings.title, like),
        ilike(offerings.description, like),
        ilike(creatorProfiles.displayName, like),
        ilike(creatorProfiles.username, like),
      )
      if (match) conds.push(match)
    }
    return conds
  }
}
