import { Inject, Injectable } from '@nestjs/common'
import { and, desc, eq, sql } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { creatorLedger, creatorPayoutAccounts, payouts, bookings, offerings } from '../database/schema'
import { generateId } from '../utils/id'
import type { LedgerStatus } from '@creonex/types'

@Injectable()
export class PayoutsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  // ── KYC / bank account ────────────────────────────────────────────────────────

  async getAccount(creatorProfileId: string) {
    return this.db
      .select()
      .from(creatorPayoutAccounts)
      .where(eq(creatorPayoutAccounts.creatorProfileId, creatorProfileId))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  async upsertAccount(
    creatorProfileId: string,
    data: {
      legalName: string
      entityType: string
      pan: string
      bankAccountNumber: string
      bankIfsc: string
      accountHolderName: string
      razorpayProductId?: string
    },
  ) {
    const existing = await this.getAccount(creatorProfileId)
    if (existing) {
      await this.db
        .update(creatorPayoutAccounts)
        .set(data)
        .where(eq(creatorPayoutAccounts.creatorProfileId, creatorProfileId))
      return
    }
    await this.db.insert(creatorPayoutAccounts).values({
      id: generateId(),
      creatorProfileId,
      ...data,
    })
  }

  // ── Ledger ──────────────────────────────────────────────────────────────────--

  /** Insert a ledger row for a booking. Idempotent — one row per booking. */
  async createLedgerEntry(data: {
    creatorProfileId: string
    bookingId: string
    grossPaise: number
    platformFeePaise: number
    feeBps: number
    netPaise: number
    razorpayTransferId?: string | null
    status: LedgerStatus
  }) {
    await this.db
      .insert(creatorLedger)
      .values({ id: generateId(), ...data })
      .onConflictDoNothing({ target: creatorLedger.bookingId })
  }

  async setLedgerStatusByBooking(
    bookingId: string,
    status: LedgerStatus,
    razorpayTransferId?: string | null,
  ) {
    const set: Partial<typeof creatorLedger.$inferInsert> = { status }
    if (razorpayTransferId !== undefined) set.razorpayTransferId = razorpayTransferId
    await this.db.update(creatorLedger).set(set).where(eq(creatorLedger.bookingId, bookingId))
  }

  async findLedgerByBooking(bookingId: string) {
    return this.db
      .select()
      .from(creatorLedger)
      .where(eq(creatorLedger.bookingId, bookingId))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  /** Pending ledger rows + their booking's payment id — to transfer once KYC verifies. */
  async findPendingWithPayment(creatorProfileId: string) {
    return this.db
      .select({
        bookingId: creatorLedger.bookingId,
        netPaise: creatorLedger.netPaise,
        razorpayPaymentId: bookings.razorpayPaymentId,
      })
      .from(creatorLedger)
      .innerJoin(bookings, eq(creatorLedger.bookingId, bookings.id))
      .where(and(eq(creatorLedger.creatorProfileId, creatorProfileId), eq(creatorLedger.status, 'pending')))
  }

  /** Move all `held` rows to `settled` — called once KYC is verified. */
  async releaseHeld(creatorProfileId: string) {
    await this.db
      .update(creatorLedger)
      .set({ status: 'settled' })
      .where(and(eq(creatorLedger.creatorProfileId, creatorProfileId), eq(creatorLedger.status, 'held')))
  }

  /** Net-paise totals grouped by ledger status. */
  async earningsByStatus(creatorProfileId: string): Promise<Record<string, number>> {
    const rows = await this.db
      .select({
        status: creatorLedger.status,
        net: sql<number>`coalesce(sum(${creatorLedger.netPaise}), 0)`,
        gross: sql<number>`coalesce(sum(${creatorLedger.grossPaise}), 0)`,
      })
      .from(creatorLedger)
      .where(eq(creatorLedger.creatorProfileId, creatorProfileId))
      .groupBy(creatorLedger.status)
    const out: Record<string, number> = {}
    for (const r of rows) out[r.status] = Number(r.net)
    return out
  }

  async lifetimeTotals(creatorProfileId: string): Promise<{ gross: number; net: number }> {
    const [agg] = await this.db
      .select({
        gross: sql<number>`coalesce(sum(${creatorLedger.grossPaise}), 0)`,
        net: sql<number>`coalesce(sum(${creatorLedger.netPaise}), 0)`,
      })
      .from(creatorLedger)
      .where(
        and(
          eq(creatorLedger.creatorProfileId, creatorProfileId),
          sql`${creatorLedger.status} <> 'reversed'`,
        ),
      )
    return { gross: Number(agg?.gross ?? 0), net: Number(agg?.net ?? 0) }
  }

  async listLedger(creatorProfileId: string) {
    return this.db
      .select({
        id: creatorLedger.id,
        bookingId: creatorLedger.bookingId,
        offeringTitle: offerings.title,
        grossPaise: creatorLedger.grossPaise,
        platformFeePaise: creatorLedger.platformFeePaise,
        netPaise: creatorLedger.netPaise,
        status: creatorLedger.status,
        createdAt: creatorLedger.createdAt,
      })
      .from(creatorLedger)
      .innerJoin(bookings, eq(creatorLedger.bookingId, bookings.id))
      .innerJoin(offerings, eq(bookings.offeringId, offerings.id))
      .where(eq(creatorLedger.creatorProfileId, creatorProfileId))
      .orderBy(desc(creatorLedger.createdAt))
  }

  // ── Payout / settlement history ───────────────────────────────────────────────

  async listPayouts(creatorProfileId: string) {
    return this.db
      .select()
      .from(payouts)
      .where(eq(payouts.creatorProfileId, creatorProfileId))
      .orderBy(desc(payouts.createdAt))
  }
}
