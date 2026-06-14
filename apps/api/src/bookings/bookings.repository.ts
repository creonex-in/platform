import { Injectable, Inject } from '@nestjs/common'
import { eq, and, inArray, sql, desc } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { bookings, offerings, creatorProfiles, learnerProfiles, user } from '../database/schema'
import { generateId } from '../utils/id'

type BookingInsert = typeof bookings.$inferInsert
type BookingRow = typeof bookings.$inferSelect

@Injectable()
export class BookingsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async create(data: Omit<BookingInsert, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId()
    await this.db.insert(bookings).values({ ...data, id })
    return id
  }

  async findById(id: string): Promise<BookingRow | null> {
    return this.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  async findByIdForLearner(id: string, learnerProfileId: string): Promise<BookingRow | null> {
    return this.db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.learnerProfileId, learnerProfileId)))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  async findByRazorpayOrderId(orderId: string): Promise<BookingRow | null> {
    return this.db
      .select()
      .from(bookings)
      .where(eq(bookings.razorpayOrderId, orderId))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  async findAllByLearner(learnerProfileId: string): Promise<BookingRow[]> {
    return this.db
      .select()
      .from(bookings)
      .where(eq(bookings.learnerProfileId, learnerProfileId))
      .orderBy(sql`${bookings.createdAt} desc`)
  }

  async findAllByOffering(offeringId: string): Promise<BookingRow[]> {
    return this.db
      .select()
      .from(bookings)
      .where(eq(bookings.offeringId, offeringId))
      .orderBy(sql`${bookings.startTime} asc`)
  }

  async findAllByCreator(creatorProfileId: string) {
    return this.db
      .select({
        id: bookings.id,
        offeringId: bookings.offeringId,
        offeringTitle: offerings.title,
        offeringType: offerings.type,
        learnerProfileId: bookings.learnerProfileId,
        learnerName: user.name,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        amountPaise: bookings.amountPaise,
        topic: bookings.topic,
        meetingUrl: bookings.meetingUrl,
        cancelledAt: bookings.cancelledAt,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .innerJoin(offerings, eq(bookings.offeringId, offerings.id))
      .innerJoin(creatorProfiles, eq(offerings.creatorProfileId, creatorProfiles.id))
      .innerJoin(learnerProfiles, eq(bookings.learnerProfileId, learnerProfiles.id))
      .innerJoin(user, eq(learnerProfiles.userId, user.id))
      .where(eq(creatorProfiles.id, creatorProfileId))
      .orderBy(desc(bookings.startTime))
  }

  async confirm(
    id: string,
    data: {
      razorpayPaymentId: string
      meetingProvider?: string
      meetingUrl?: string
      calendarEventId?: string
    },
  ): Promise<void> {
    await this.db
      .update(bookings)
      .set({
        status: 'confirmed',
        razorpayPaymentId: data.razorpayPaymentId,
        meetingProvider: data.meetingProvider ?? null,
        meetingUrl: data.meetingUrl ?? null,
        calendarEventId: data.calendarEventId ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.id, id), eq(bookings.status, 'pending_payment')))
  }

  async cancel(
    id: string,
    data: { cancelledBy: string; cancellationReason?: string },
  ): Promise<void> {
    await this.db
      .update(bookings)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: data.cancelledBy,
        cancellationReason: data.cancellationReason ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookings.id, id),
          inArray(bookings.status, ['pending_payment', 'confirmed']),
        ),
      )
  }

  // ── Counters (called after confirm) ──────────────────────────────────────────

  async incrementOfferingCounters(offeringId: string, amountPaise: number): Promise<void> {
    await this.db
      .update(offerings)
      .set({
        totalBookings: sql`${offerings.totalBookings} + 1`,
        totalRevenuePaise: sql`${offerings.totalRevenuePaise} + ${amountPaise}`,
        updatedAt: new Date(),
      })
      .where(eq(offerings.id, offeringId))
  }

  /** Reverse the counters when a previously-confirmed booking is cancelled/refunded. */
  async decrementOfferingCounters(offeringId: string, amountPaise: number): Promise<void> {
    await this.db
      .update(offerings)
      .set({
        totalBookings: sql`greatest(${offerings.totalBookings} - 1, 0)`,
        totalRevenuePaise: sql`greatest(${offerings.totalRevenuePaise} - ${amountPaise}, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(offerings.id, offeringId))
  }

  async decrementSeats(offeringId: string): Promise<boolean> {
    const result = await this.db
      .update(offerings)
      .set({
        seatsRemaining: sql`${offerings.seatsRemaining} - 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(offerings.id, offeringId), sql`${offerings.seatsRemaining} > 0`))
    return (result.rowCount ?? 0) > 0
  }

  async restoreSeats(offeringId: string): Promise<void> {
    await this.db
      .update(offerings)
      .set({
        seatsRemaining: sql`${offerings.seatsRemaining} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(offerings.id, offeringId))
  }

  async incrementCreatorSessions(creatorProfileId: string): Promise<void> {
    await this.db
      .update(creatorProfiles)
      .set({ totalSessions: sql`${creatorProfiles.totalSessions} + 1` })
      .where(eq(creatorProfiles.id, creatorProfileId))
  }
}
