import { Inject, Injectable } from '@nestjs/common'
import { and, between, eq, inArray } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import {
  schedules, scheduleRules, scheduleOverrides, offerings, bookings,
} from '../database/schema'
import { generateId } from '../utils/id'

@Injectable()
export class SchedulesRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  // ── Schedules ───────────────────────────────────────────────────────────────

  async findAllByCreatorProfileId(creatorProfileId: string) {
    return this.db
      .select()
      .from(schedules)
      .where(eq(schedules.creatorProfileId, creatorProfileId))
  }

  async findByIdWithDetails(id: string) {
    const schedule = await this.db
      .select()
      .from(schedules)
      .where(eq(schedules.id, id))
      .limit(1)
      .then((r) => r[0] ?? null)
    if (!schedule) return null

    const [rules, overrides] = await Promise.all([
      this.db.select().from(scheduleRules).where(eq(scheduleRules.scheduleId, id)),
      this.db.select().from(scheduleOverrides).where(eq(scheduleOverrides.scheduleId, id)),
    ])

    return { ...schedule, rules, overrides }
  }

  async findByIdForOwner(id: string, creatorProfileId: string) {
    return this.db
      .select()
      .from(schedules)
      .where(and(eq(schedules.id, id), eq(schedules.creatorProfileId, creatorProfileId)))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  async create(data: { creatorProfileId: string; name: string; timezone: string; isDefault?: boolean }) {
    const id = generateId()
    // If new default, clear existing default first
    if (data.isDefault) {
      await this.db
        .update(schedules)
        .set({ isDefault: false })
        .where(eq(schedules.creatorProfileId, data.creatorProfileId))
    }
    await this.db.insert(schedules).values({
      id,
      creatorProfileId: data.creatorProfileId,
      name: data.name,
      timezone: data.timezone,
      isDefault: data.isDefault ?? false,
    })
    return id
  }

  async update(id: string, data: { name?: string; timezone?: string; isDefault?: boolean }) {
    await this.db.update(schedules).set(data).where(eq(schedules.id, id))
  }

  async delete(id: string) {
    await this.db.delete(schedules).where(eq(schedules.id, id))
  }

  // ── Rules ───────────────────────────────────────────────────────────────────

  async addRule(scheduleId: string, data: { rrule: string; startTime: string; endTime: string }) {
    const id = generateId()
    await this.db.insert(scheduleRules).values({ id, scheduleId, ...data })
    return id
  }

  async findRuleById(ruleId: string) {
    return this.db
      .select()
      .from(scheduleRules)
      .where(eq(scheduleRules.id, ruleId))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  async updateRule(ruleId: string, data: { rrule?: string; startTime?: string; endTime?: string }) {
    await this.db.update(scheduleRules).set(data).where(eq(scheduleRules.id, ruleId))
  }

  async deleteRule(ruleId: string) {
    await this.db.delete(scheduleRules).where(eq(scheduleRules.id, ruleId))
  }

  // ── Overrides ───────────────────────────────────────────────────────────────

  async addOverride(
    scheduleId: string,
    data: { date: string; type: string; startTime?: string; endTime?: string },
  ) {
    const id = generateId()
    await this.db.insert(scheduleOverrides).values({
      id,
      scheduleId,
      date: data.date,
      type: data.type as typeof scheduleOverrides.$inferInsert['type'],
      startTime: data.startTime,
      endTime: data.endTime,
    })
    return id
  }

  async findOverrideById(overrideId: string) {
    return this.db
      .select()
      .from(scheduleOverrides)
      .where(eq(scheduleOverrides.id, overrideId))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  async deleteOverride(overrideId: string) {
    await this.db.delete(scheduleOverrides).where(eq(scheduleOverrides.id, overrideId))
  }

  // ── Slot generation data ────────────────────────────────────────────────────

  async findOfferingWithScheduleData(offeringId: string) {
    const offering = await this.db
      .select()
      .from(offerings)
      .where(eq(offerings.id, offeringId))
      .limit(1)
      .then((r) => r[0] ?? null)
    if (!offering) return null

    // Use offering's explicit scheduleId, or fall back to creator's default schedule
    const scheduleId = offering.scheduleId
      ?? await this.findDefaultScheduleId(offering.creatorProfileId)
    if (!scheduleId) return null

    const scheduleData = await this.findByIdWithDetails(scheduleId)
    if (!scheduleData) return null

    return { offering, schedule: scheduleData }
  }

  private async findDefaultScheduleId(creatorProfileId: string): Promise<string | null> {
    const rows = await this.db
      .select({ id: schedules.id })
      .from(schedules)
      .where(and(eq(schedules.creatorProfileId, creatorProfileId), eq(schedules.isDefault, true)))
      .limit(1)
    if (rows[0]) return rows[0].id

    // No default marked — return the first schedule for this creator if any
    const any = await this.db
      .select({ id: schedules.id })
      .from(schedules)
      .where(eq(schedules.creatorProfileId, creatorProfileId))
      .limit(1)
    return any[0]?.id ?? null
  }

  async findActiveBookings(offeringId: string, fromUtc: Date, toUtc: Date) {
    return this.db
      .select({ startTime: bookings.startTime })
      .from(bookings)
      .where(
        and(
          eq(bookings.offeringId, offeringId),
          inArray(bookings.status, ['pending_payment', 'confirmed']),
          between(bookings.startTime, fromUtc, toUtc),
        ),
      )
  }
}
