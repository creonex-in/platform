import { Inject, Injectable } from '@nestjs/common'
import { and, count, desc, eq, inArray } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import {
  learnerSaved,
  learnerNotes,
  creatorProfiles,
  offerings,
} from '../database/schema'
import { generateId } from '../utils/id'
import type { LearnerSavedItem } from '@creonex/types'

@Injectable()
export class LearnerRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  // ── Saved / bookmarks ──────────────────────────────────────────────────────

  async listSaved(learnerProfileId: string): Promise<LearnerSavedItem[]> {
    const rows = await this.db
      .select()
      .from(learnerSaved)
      .where(eq(learnerSaved.learnerProfileId, learnerProfileId))
      .orderBy(desc(learnerSaved.createdAt))

    const creatorIds = rows.filter((r) => r.targetType === 'creator').map((r) => r.targetId)
    const offeringIds = rows.filter((r) => r.targetType === 'offering').map((r) => r.targetId)

    const creators = creatorIds.length
      ? await this.db
          .select({
            id: creatorProfiles.id,
            username: creatorProfiles.username,
            displayName: creatorProfiles.displayName,
            primaryNiche: creatorProfiles.primaryNiche,
            profilePhotoUrl: creatorProfiles.profilePhotoUrl,
          })
          .from(creatorProfiles)
          .where(inArray(creatorProfiles.id, creatorIds))
      : []
    const offers = offeringIds.length
      ? await this.db
          .select({
            id: offerings.id,
            title: offerings.title,
            type: offerings.type,
            thumbnailUrl: offerings.thumbnailUrl,
            username: creatorProfiles.username,
            creatorName: creatorProfiles.displayName,
          })
          .from(offerings)
          .innerJoin(creatorProfiles, eq(offerings.creatorProfileId, creatorProfiles.id))
          .where(inArray(offerings.id, offeringIds))
      : []

    const creatorMap = new Map(creators.map((c) => [c.id, c]))
    const offerMap = new Map(offers.map((o) => [o.id, o]))

    return rows.map((r) => {
      if (r.targetType === 'creator') {
        const c = creatorMap.get(r.targetId)
        return {
          id: r.id,
          targetType: r.targetType,
          targetId: r.targetId,
          createdAt: r.createdAt as unknown as string,
          title: c?.displayName ?? null,
          subtitle: c?.primaryNiche ?? null,
          imageUrl: c?.profilePhotoUrl ?? null,
          href: c?.username ? `/c/${c.username}` : null,
        }
      }
      const o = offerMap.get(r.targetId)
      return {
        id: r.id,
        targetType: r.targetType,
        targetId: r.targetId,
        createdAt: r.createdAt as unknown as string,
        title: o?.title ?? null,
        subtitle: o?.creatorName ?? null,
        imageUrl: o?.thumbnailUrl ?? null,
        href: o?.username ? `/c/${o.username}#offerings` : null,
      }
    })
  }

  async createSaved(learnerProfileId: string, targetType: string, targetId: string) {
    const id = generateId()
    await this.db
      .insert(learnerSaved)
      .values({ id, learnerProfileId, targetType, targetId })
      .onConflictDoNothing()
    return id
  }

  async deleteSavedByTarget(learnerProfileId: string, targetType: string, targetId: string) {
    await this.db
      .delete(learnerSaved)
      .where(
        and(
          eq(learnerSaved.learnerProfileId, learnerProfileId),
          eq(learnerSaved.targetType, targetType),
          eq(learnerSaved.targetId, targetId),
        ),
      )
  }

  async countSaved(learnerProfileId: string): Promise<number> {
    const r = await this.db
      .select({ value: count() })
      .from(learnerSaved)
      .where(eq(learnerSaved.learnerProfileId, learnerProfileId))
    return r[0]?.value ?? 0
  }

  // ── Notes ──────────────────────────────────────────────────────────────────

  listNotes(learnerProfileId: string) {
    return this.db
      .select()
      .from(learnerNotes)
      .where(eq(learnerNotes.learnerProfileId, learnerProfileId))
      .orderBy(desc(learnerNotes.updatedAt))
  }

  findNote(id: string, learnerProfileId: string) {
    return this.db
      .select()
      .from(learnerNotes)
      .where(and(eq(learnerNotes.id, id), eq(learnerNotes.learnerProfileId, learnerProfileId)))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  async createNote(
    learnerProfileId: string,
    data: { title: string; content?: string; bookingId?: string; offeringId?: string },
  ) {
    const id = generateId()
    await this.db.insert(learnerNotes).values({
      id,
      learnerProfileId,
      title: data.title,
      content: data.content ?? '',
      bookingId: data.bookingId ?? null,
      offeringId: data.offeringId ?? null,
    })
    return id
  }

  async updateNote(id: string, learnerProfileId: string, data: { title?: string; content?: string }) {
    await this.db
      .update(learnerNotes)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
      })
      .where(and(eq(learnerNotes.id, id), eq(learnerNotes.learnerProfileId, learnerProfileId)))
  }

  async deleteNote(id: string, learnerProfileId: string) {
    await this.db
      .delete(learnerNotes)
      .where(and(eq(learnerNotes.id, id), eq(learnerNotes.learnerProfileId, learnerProfileId)))
  }
}
