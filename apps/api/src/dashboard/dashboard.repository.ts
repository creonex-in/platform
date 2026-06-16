import { Inject, Injectable } from '@nestjs/common'
import { and, asc, desc, eq, gt, gte, lt, sql } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import {
  bookings,
  creatorLedger,
  creatorProfiles,
  learnerProfiles,
  offerings,
  payouts,
  testimonials,
  user,
} from '../database/schema'
import type { ActivityFeedItemDto } from './dto/dashboard-summary.dto'

@Injectable()
export class DashboardRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  // ── Shared booking select shape (matches CreatorBookingItem) ─────────────────

  private bookingSelect() {
    return {
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
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private bookingJoins(qb: any) {
    return qb
      .innerJoin(offerings, eq(bookings.offeringId, offerings.id))
      .innerJoin(creatorProfiles, eq(offerings.creatorProfileId, creatorProfiles.id))
      .innerJoin(learnerProfiles, eq(bookings.learnerProfileId, learnerProfiles.id))
      .innerJoin(user, eq(learnerProfiles.userId, user.id))
  }

  // ── Today's sessions ─────────────────────────────────────────────────────────

  async findTodaySessions(creatorProfileId: string, tz: string) {
    // Compute today's bounds in the creator's timezone using SQL AT TIME ZONE
    const todayStart = sql<Date>`date_trunc('day', now() AT TIME ZONE ${tz}) AT TIME ZONE ${tz}`
    const todayEnd = sql<Date>`(date_trunc('day', now() AT TIME ZONE ${tz}) + interval '1 day') AT TIME ZONE ${tz}`

    const rows = await this.bookingJoins(
      this.db.select(this.bookingSelect()).from(bookings),
    ).where(
      and(
        eq(creatorProfiles.id, creatorProfileId),
        eq(bookings.status, 'confirmed'),
        gte(bookings.startTime, todayStart),
        lt(bookings.startTime, todayEnd),
      ),
    ).orderBy(asc(bookings.startTime))

    return this.mapBookings(rows)
  }

  // ── Next upcoming session (when no sessions today) ───────────────────────────

  async findNextSession(creatorProfileId: string) {
    const now = new Date()
    const rows = await this.bookingJoins(
      this.db.select(this.bookingSelect()).from(bookings),
    ).where(
      and(
        eq(creatorProfiles.id, creatorProfileId),
        eq(bookings.status, 'confirmed'),
        gt(bookings.startTime, now),
      ),
    ).orderBy(asc(bookings.startTime))
      .limit(1)

    return rows.length ? this.mapBookings(rows)[0] : null
  }

  // ── New bookings since last dashboard visit ───────────────────────────────────

  async findNewBookings(creatorProfileId: string, since: Date) {
    const rows = await this.bookingJoins(
      this.db.select(this.bookingSelect()).from(bookings),
    ).where(
      and(
        eq(creatorProfiles.id, creatorProfileId),
        eq(bookings.status, 'confirmed'),
        gt(bookings.createdAt, since),
      ),
    ).orderBy(desc(bookings.createdAt))

    return this.mapBookings(rows)
  }

  // ── Earnings summary ─────────────────────────────────────────────────────────

  async getEarningsSummary(creatorProfileId: string) {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay()) // ISO week start (Sunday)
    weekStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [thisWeek, thisMonth, pending] = await Promise.all([
      this.db
        .select({ total: sql<number>`coalesce(sum(${creatorLedger.netPaise}), 0)` })
        .from(creatorLedger)
        .where(
          and(
            eq(creatorLedger.creatorProfileId, creatorProfileId),
            sql`${creatorLedger.status} <> 'reversed'`,
            gte(creatorLedger.createdAt, weekStart),
          ),
        )
        .then((r) => Number(r[0]?.total ?? 0)),

      this.db
        .select({ total: sql<number>`coalesce(sum(${creatorLedger.netPaise}), 0)` })
        .from(creatorLedger)
        .where(
          and(
            eq(creatorLedger.creatorProfileId, creatorProfileId),
            sql`${creatorLedger.status} <> 'reversed'`,
            gte(creatorLedger.createdAt, monthStart),
          ),
        )
        .then((r) => Number(r[0]?.total ?? 0)),

      this.db
        .select({ total: sql<number>`coalesce(sum(${creatorLedger.netPaise}), 0)` })
        .from(creatorLedger)
        .where(
          and(
            eq(creatorLedger.creatorProfileId, creatorProfileId),
            eq(creatorLedger.status, 'pending'),
          ),
        )
        .then((r) => Number(r[0]?.total ?? 0)),
    ])

    return { thisWeekPaise: thisWeek, thisMonthPaise: thisMonth, pendingPaise: pending }
  }

  // ── Quick stats with niche rank ───────────────────────────────────────────────

  async getQuickStats(creatorProfileId: string) {
    const rows = await this.db.execute<{
      total_sessions: number
      total_reviews: number
      smoothed_rating: string
      niche_rank: number
      niche_total: number
    }>(sql`
      WITH ranked AS (
        SELECT
          id,
          total_sessions,
          total_reviews,
          smoothed_rating,
          RANK()  OVER (PARTITION BY primary_niche ORDER BY quality_score DESC) AS niche_rank,
          COUNT(*) OVER (PARTITION BY primary_niche)                            AS niche_total
        FROM creator_profiles
        WHERE primary_niche IS NOT NULL AND is_live = true
      )
      SELECT total_sessions, total_reviews, smoothed_rating, niche_rank, niche_total
      FROM ranked WHERE id = ${creatorProfileId}
    `)

    const row = rows.rows?.[0]
    if (!row) {
      // creator not live or no niche — fall back to profile columns
      const [profile] = await this.db
        .select({
          totalSessions: creatorProfiles.totalSessions,
          totalReviews: creatorProfiles.totalReviews,
          smoothedRating: creatorProfiles.smoothedRating,
        })
        .from(creatorProfiles)
        .where(eq(creatorProfiles.id, creatorProfileId))
        .limit(1)
      return {
        totalSessions: profile?.totalSessions ?? 0,
        totalReviews: profile?.totalReviews ?? 0,
        avgRating: Number(profile?.smoothedRating ?? 0),
        nicheRank: 0,
        nicheTotal: 0,
      }
    }

    return {
      totalSessions: Number(row.total_sessions),
      totalReviews: Number(row.total_reviews),
      avgRating: Number(row.smoothed_rating),
      nicheRank: Number(row.niche_rank),
      nicheTotal: Number(row.niche_total),
    }
  }

  // ── Activity feed (synthetic UNION) ─────────────────────────────────────────

  async getActivityFeed(creatorProfileId: string): Promise<ActivityFeedItemDto[]> {
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const [recentPayouts, recentTestimonials, recentBookings] = await Promise.all([
      this.db
        .select({ id: payouts.id, amountPaise: payouts.amountPaise, createdAt: payouts.createdAt })
        .from(payouts)
        .where(
          and(
            eq(payouts.creatorProfileId, creatorProfileId),
            eq(payouts.status, 'paid'),
            gte(payouts.createdAt, since),
          ),
        )
        .orderBy(desc(payouts.createdAt))
        .limit(10),

      this.db
        .select({
          id: testimonials.id,
          learnerName: testimonials.learnerName,
          rating: testimonials.rating,
          createdAt: testimonials.createdAt,
        })
        .from(testimonials)
        .where(
          and(
            eq(testimonials.creatorProfileId, creatorProfileId),
            gte(testimonials.createdAt, since),
          ),
        )
        .orderBy(desc(testimonials.createdAt))
        .limit(10),

      this.bookingJoins(this.db.select(this.bookingSelect()).from(bookings))
        .where(
          and(
            eq(creatorProfiles.id, creatorProfileId),
            eq(bookings.status, 'confirmed'),
            gte(bookings.createdAt, since),
          ),
        )
        .orderBy(desc(bookings.createdAt))
        .limit(10),
    ])

    const feed: ActivityFeedItemDto[] = []

    for (const p of recentPayouts) {
      feed.push({
        id: `payout-${p.id}`,
        type: 'payout',
        message: `Your payout of ₹${Math.round(p.amountPaise / 100).toLocaleString('en-IN')} was processed`,
        occurredAt: p.createdAt.toISOString(),
      })
    }

    for (const t of recentTestimonials) {
      const stars = '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating)
      feed.push({
        id: `review-${t.id}`,
        type: 'review',
        message: `${t.learnerName} left you a ${t.rating}-star review ${stars}`,
        occurredAt: t.createdAt.toISOString(),
      })
    }

    for (const b of this.mapBookings(recentBookings)) {
      const dateStr = b.startTime
        ? new Date(b.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : ''
      const typeLabel = b.offeringType === 'one_on_one' ? '1:1' : b.offeringType === 'live_event' ? 'live event' : 'digital'
      feed.push({
        id: `booking-${b.id}`,
        type: 'booking',
        message: `${b.learnerName} booked a ${typeLabel} session${dateStr ? ` for ${dateStr}` : ''}`,
        occurredAt: b.createdAt,
      })
    }

    return feed.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 15)
  }

  // ── Earnings trend (last 8 weeks) ────────────────────────────────────────────

  async getEarningsTrend(creatorProfileId: string) {
    const rows = await this.db.execute<{ week_start: string; earnings_paise: string }>(sql`
      SELECT
        to_char(date_trunc('week', created_at), 'Mon DD') AS week_start,
        coalesce(sum(net_paise), 0)::bigint               AS earnings_paise
      FROM creator_ledger
      WHERE creator_profile_id = ${creatorProfileId}
        AND status <> 'reversed'
        AND created_at >= now() - interval '8 weeks'
      GROUP BY date_trunc('week', created_at)
      ORDER BY date_trunc('week', created_at)
    `)
    return (rows.rows ?? []).map((r) => ({
      week: r.week_start,
      earningsPaise: Number(r.earnings_paise),
    }))
  }

  // ── Bookings trend (last 30 days) ─────────────────────────────────────────────

  async getBookingsTrend(creatorProfileId: string) {
    const rows = await this.db.execute<{ day: string; cnt: string }>(sql`
      SELECT
        to_char(b.created_at, 'Mon DD') AS day,
        count(*)::bigint                AS cnt
      FROM bookings b
      JOIN offerings o ON b.offering_id = o.id
      JOIN creator_profiles cp ON o.creator_profile_id = cp.id
      WHERE cp.id = ${creatorProfileId}
        AND b.status = 'confirmed'
        AND b.created_at >= now() - interval '30 days'
      GROUP BY date_trunc('day', b.created_at), to_char(b.created_at, 'Mon DD')
      ORDER BY date_trunc('day', b.created_at)
    `)
    return (rows.rows ?? []).map((r) => ({
      date: r.day,
      count: Number(r.cnt),
    }))
  }

  // ── Mark dashboard visited ───────────────────────────────────────────────────

  async markVisited(creatorProfileId: string) {
    await this.db
      .update(creatorProfiles)
      .set({ lastDashboardVisitAt: new Date() })
      .where(eq(creatorProfiles.id, creatorProfileId))
  }

  async getLastVisit(creatorProfileId: string): Promise<Date> {
    const [row] = await this.db
      .select({ lastDashboardVisitAt: creatorProfiles.lastDashboardVisitAt })
      .from(creatorProfiles)
      .where(eq(creatorProfiles.id, creatorProfileId))
      .limit(1)
    // Default to 48 hours ago if never visited
    return row?.lastDashboardVisitAt ?? new Date(Date.now() - 48 * 60 * 60 * 1000)
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapBookings(rows: any[]) {
    return rows.map((r) => ({
      ...r,
      startTime: r.startTime?.toISOString() ?? null,
      endTime: r.endTime?.toISOString() ?? null,
      cancelledAt: r.cancelledAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    }))
  }
}
