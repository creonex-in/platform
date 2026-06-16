import { Inject, Injectable } from '@nestjs/common'
import { and, desc, eq, sql } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { creatorProfiles, testimonials } from '../database/schema'
import { generateId } from '../utils/id'

@Injectable()
export class TestimonialsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findPublicByCreatorProfileId(creatorProfileId: string) {
    return this.db
      .select()
      .from(testimonials)
      .where(
        and(
          eq(testimonials.creatorProfileId, creatorProfileId),
          eq(testimonials.isPublic, true),
        ),
      )
      .orderBy(desc(testimonials.createdAt))
  }

  async findAllByCreatorProfileId(creatorProfileId: string) {
    return this.db
      .select()
      .from(testimonials)
      .where(eq(testimonials.creatorProfileId, creatorProfileId))
      .orderBy(desc(testimonials.createdAt))
  }

  async create(data: {
    creatorProfileId: string
    userId: string
    learnerName: string
    learnerRole?: string
    content: string
    rating: number
    isVerified: boolean
  }): Promise<string> {
    const id = generateId()
    await this.db.insert(testimonials).values({
      id,
      creatorProfileId: data.creatorProfileId,
      userId: data.userId,
      learnerName: data.learnerName,
      learnerRole: data.learnerRole ?? null,
      content: data.content,
      rating: data.rating,
      isVerified: data.isVerified,
      isPublic: true,
    })
    return id
  }

  /** True if this user already reviewed this creator (pre-check before insert; the
   *  unique index is the hard guard). */
  async existsForUser(userId: string, creatorProfileId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: testimonials.id })
      .from(testimonials)
      .where(and(eq(testimonials.userId, userId), eq(testimonials.creatorProfileId, creatorProfileId)))
      .limit(1)
    return rows.length > 0
  }

  async updateVisibility(id: string, creatorProfileId: string, isPublic: boolean): Promise<void> {
    await this.db
      .update(testimonials)
      .set({ isPublic })
      .where(and(eq(testimonials.id, id), eq(testimonials.creatorProfileId, creatorProfileId)))
  }

  /**
   * Recompute the denormalized rating aggregates on `creator_profiles` from this
   * creator's PUBLIC testimonials. Single source of truth for what the public
   * profile and the creator dashboard both display. Call after any change that
   * affects the public review set (new review, visibility toggle).
   */
  async recomputeRatingAggregates(creatorProfileId: string): Promise<void> {
    const [agg] = await this.db
      .select({
        count: sql<number>`count(*)`,
        avg: sql<number>`coalesce(avg(${testimonials.rating}), 0)`,
      })
      .from(testimonials)
      .where(
        and(
          eq(testimonials.creatorProfileId, creatorProfileId),
          eq(testimonials.isPublic, true),
        ),
      )

    await this.db
      .update(creatorProfiles)
      .set({
        totalReviews: Number(agg?.count ?? 0),
        smoothedRating: Number(agg?.avg ?? 0).toFixed(2),
      })
      .where(eq(creatorProfiles.id, creatorProfileId))
  }
}
