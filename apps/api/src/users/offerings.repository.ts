import { Inject, Injectable } from '@nestjs/common'
import { and, count, desc, eq } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { bookings, offerings } from '../database/schema'
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

  async findPublicByCreatorProfileId(creatorProfileId: string) {
    return this.db
      .select()
      .from(offerings)
      .where(
        and(
          eq(offerings.creatorProfileId, creatorProfileId),
          eq(offerings.status, 'live'),
        ),
      )
      .orderBy(offerings.createdAt)
  }

  async create(data: {
    creatorProfileId: string
    type: string
    title: string
    priceInPaise: number
    durationMinutes?: number
    seatsTotal?: number
    status?: string
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
      status: (data.status ?? 'live') as typeof offerings.$inferInsert['status'],
    })
    return id
  }

  async findAllByCreatorProfileId(creatorProfileId: string) {
    return this.db
      .select()
      .from(offerings)
      .where(eq(offerings.creatorProfileId, creatorProfileId))
      .orderBy(desc(offerings.createdAt))
  }

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(offerings)
      .where(eq(offerings.id, id))
      .limit(1)
    return result[0] ?? null
  }

  async findByIdForOwner(id: string, creatorProfileId: string) {
    const result = await this.db
      .select()
      .from(offerings)
      .where(and(eq(offerings.id, id), eq(offerings.creatorProfileId, creatorProfileId)))
      .limit(1)
    return result[0] ?? null
  }

  async update(
    id: string,
    data: {
      title?: string
      description?: string | null
      price?: number
      durationMinutes?: number | null
      seatsTotal?: number | null
      minNoticeMinutes?: number
      bookingWindowDays?: number
      bufferAfterMinutes?: number
    },
  ) {
    await this.db.update(offerings).set(data).where(eq(offerings.id, id))
  }

  /** Backstop count of booking rows for an offering (don't trust the cached counter). */
  async countBookings(offeringId: string): Promise<number> {
    const result = await this.db
      .select({ value: count() })
      .from(bookings)
      .where(eq(bookings.offeringId, offeringId))
    return result[0]?.value ?? 0
  }

  /** Hard delete — caller must enforce it's safe (draft + no bookings). */
  async delete(id: string) {
    await this.db.delete(offerings).where(eq(offerings.id, id))
  }

  async updateStatus(id: string, status: string) {
    await this.db
      .update(offerings)
      .set({ status: status as typeof offerings.$inferInsert['status'] })
      .where(eq(offerings.id, id))
  }
}
