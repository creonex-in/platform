import { Inject, Injectable } from '@nestjs/common'
import { and, desc, eq } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { testimonials } from '../database/schema'

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
}
