import { Inject, Injectable } from '@nestjs/common'
import { and, desc, eq, ilike, or } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { creatorProfiles, offerings } from '../database/schema'

@Injectable()
export class SearchRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  /** Live creators whose display name or handle matches, best (highest quality) first. */
  async searchCreators(term: string, limit: number) {
    const like = `%${term}%`
    return this.db
      .select({
        id: creatorProfiles.id,
        username: creatorProfiles.username,
        displayName: creatorProfiles.displayName,
        profilePhotoUrl: creatorProfiles.profilePhotoUrl,
        primaryNiche: creatorProfiles.primaryNiche,
        rating: creatorProfiles.smoothedRating,
      })
      .from(creatorProfiles)
      .where(
        and(
          eq(creatorProfiles.isLive, true),
          or(ilike(creatorProfiles.displayName, like), ilike(creatorProfiles.username, like)),
        ),
      )
      .orderBy(desc(creatorProfiles.qualityScore))
      .limit(limit)
  }

  /** Live offerings whose title matches, joined to their (live) creator. */
  async searchOfferings(term: string, limit: number) {
    const like = `%${term}%`
    return this.db
      .select({
        id: offerings.id,
        title: offerings.title,
        price: offerings.price,
        thumbnailUrl: offerings.thumbnailUrl,
        username: creatorProfiles.username,
        displayName: creatorProfiles.displayName,
      })
      .from(offerings)
      .innerJoin(creatorProfiles, eq(offerings.creatorProfileId, creatorProfiles.id))
      .where(
        and(
          eq(offerings.status, 'live'),
          eq(creatorProfiles.isLive, true),
          ilike(offerings.title, like),
        ),
      )
      .orderBy(desc(creatorProfiles.qualityScore))
      .limit(limit)
  }
}
