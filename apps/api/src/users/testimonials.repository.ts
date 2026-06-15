import { Inject, Injectable } from '@nestjs/common'
import { and, desc, eq } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { testimonials } from '../database/schema'
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
}
