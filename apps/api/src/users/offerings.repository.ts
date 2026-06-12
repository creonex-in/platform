import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { offerings } from '../database/schema'
import { generateId } from '../utils/id'

@Injectable()
export class OfferingsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findFirstByCreatorProfileId(creatorProfileId: string) {
    const result = await this.db
      .select({ id: offerings.id })
      .from(offerings)
      .where(eq(offerings.creatorProfileId, creatorProfileId))
      .limit(1)
    return result[0] ?? null
  }

  async create(data: {
    creatorProfileId: string
    type: string
    title: string
    priceInPaise: number
    durationMinutes?: number
    seatsTotal?: number
  }) {
    const id = generateId()
    await this.db.insert(offerings).values({
      id,
      creatorProfileId: data.creatorProfileId,
      type: data.type as typeof offerings.$inferInsert['type'],
      title: data.title,
      price: data.priceInPaise,
      durationMinutes: data.durationMinutes,
      seatsTotal: data.seatsTotal,
      seatsRemaining: data.seatsTotal,
      status: 'live',
    })
    return id
  }
}
