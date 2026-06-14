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
    learnerName: string
    learnerRole?: string
    content: string
    rating: number
  }): Promise<string> {
    const id = generateId()
    await this.db.insert(testimonials).values({
      id,
      creatorProfileId: data.creatorProfileId,
      learnerName: data.learnerName,
      learnerRole: data.learnerRole ?? null,
      content: data.content,
      rating: data.rating,
      isPublic: true,
    })
    return id
  }

  async updateVisibility(id: string, creatorProfileId: string, isPublic: boolean): Promise<void> {
    await this.db
      .update(testimonials)
      .set({ isPublic })
      .where(and(eq(testimonials.id, id), eq(testimonials.creatorProfileId, creatorProfileId)))
  }
}
