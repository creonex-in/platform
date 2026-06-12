import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import {
  user,
  learnerProfiles,
  creatorProfiles,
  creatorTags,
  offerings,
} from '../database/schema'
import { generateId } from '../utils/id'

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1)
    return result[0] ?? null
  }

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)
    return result[0] ?? null
  }

  async getLearnerProfile(userId: string) {
    const result = await this.db
      .select()
      .from(learnerProfiles)
      .where(eq(learnerProfiles.userId, userId))
      .limit(1)
    return result[0] ?? null
  }

  async getCreatorProfile(userId: string) {
    const result = await this.db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, userId))
      .limit(1)
    return result[0] ?? null
  }

  async createLearnerProfile(userId: string) {
    const [profile] = await this.db
      .insert(learnerProfiles)
      .values({ id: generateId(), userId })
      .onConflictDoNothing()
      .returning()
    return profile ?? null
  }

  async createCreatorProfile(userId: string) {
    const [profile] = await this.db
      .insert(creatorProfiles)
      .values({ id: generateId(), userId })
      .onConflictDoNothing()
      .returning()
    return profile ?? null
  }

  async updateLearnerStep1(
    userId: string,
    data: { goalType: string; interestedNiches?: string[] },
  ) {
    await this.db
      .update(learnerProfiles)
      .set({
        goalType: data.goalType as typeof learnerProfiles.$inferInsert['goalType'],
        interestedNiches: data.interestedNiches ?? [],
        onboardingStatus: 'complete',
        currentStep: 2,
        updatedAt: new Date(),
      })
      .where(eq(learnerProfiles.userId, userId))
  }

  async updateCreatorStep1(
    userId: string,
    data: {
      displayName: string
      primaryNiche: string
      experienceYears: number
    },
  ) {
    await this.db
      .update(creatorProfiles)
      .set({
        displayName: data.displayName,
        primaryNiche: data.primaryNiche as typeof creatorProfiles.$inferInsert['primaryNiche'],
        experienceYears: data.experienceYears,
        onboardingStatus: 'in_progress',
        currentStep: 2,
        updatedAt: new Date(),
      })
      .where(eq(creatorProfiles.userId, userId))
  }

  async updateCreatorStep2(
    userId: string,
    data: { bio: string; tags: string[]; photoUrl?: string },
  ) {
    await this.db.transaction(async (tx) => {
      await tx
        .update(creatorProfiles)
        .set({
          bio: data.bio,
          profilePhotoUrl: data.photoUrl ?? null,
          onboardingStatus: 'in_progress',
          currentStep: 3,
          updatedAt: new Date(),
        })
        .where(eq(creatorProfiles.userId, userId))

      const profile = await tx
        .select({ id: creatorProfiles.id })
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, userId))
        .limit(1)
        .then((r) => r[0])

      if (!profile) return

      await tx
        .delete(creatorTags)
        .where(eq(creatorTags.creatorProfileId, profile.id))

      if (data.tags.length > 0) {
        await tx.insert(creatorTags).values(
          data.tags.map((tag) => ({
            id: generateId(),
            creatorProfileId: profile.id,
            tag,
          })),
        )
      }
    })
  }

  async updateCreatorStep3GoLive(
    userId: string,
    data: {
      offerType: string
      title: string
      price: number
      durationMinutes?: number
    },
  ) {
    return await this.db.transaction(async (tx) => {
      const profile = await tx
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, userId))
        .limit(1)
        .then((r) => r[0])

      if (!profile) throw new Error('Creator profile not found')

      // Idempotent — if already live return existing offering
      if (profile.isLive) {
        const existingOffer = await tx
          .select({ id: offerings.id })
          .from(offerings)
          .where(eq(offerings.creatorProfileId, profile.id))
          .limit(1)
          .then((r) => r[0])
        return { profile, offeringId: existingOffer?.id }
      }

      const username = await generateUsername(profile.displayName ?? '', tx)
      const boostEnd = new Date()
      boostEnd.setDate(boostEnd.getDate() + 14)

      await tx
        .update(creatorProfiles)
        .set({
          username,
          isLive: true,
          inDiscoveryBoost: true,
          boostEndDate: boostEnd,
          onboardingStatus: 'complete',
          currentStep: 4,
          updatedAt: new Date(),
        })
        .where(eq(creatorProfiles.userId, userId))

      const offeringId = generateId()
      await tx.insert(offerings).values({
        id: offeringId,
        creatorProfileId: profile.id,
        type: data.offerType as typeof offerings.$inferInsert['type'],
        title: data.title,
        price: data.price * 100, // INR → paise
        durationMinutes: data.durationMinutes,
        status: 'live',
      })

      return { profile: { ...profile, username }, offeringId }
    })
  }

  async updateUserName(userId: string, firstName: string, lastName?: string) {
    await this.db
      .update(user)
      .set({ name: [firstName, lastName].filter(Boolean).join(' '), updatedAt: new Date() })
      .where(eq(user.id, userId))
  }

  async updateUserRole(userId: string, role: string) {
    await this.db
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(eq(user.id, userId))
  }
}

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0]

async function generateUsername(
  displayName: string,
  tx: Database | Tx,
): Promise<string> {
  const base = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20)
  let candidate = base || 'creator'
  let suffix = 0

  while (true) {
    const existing = await tx
      .select({ id: creatorProfiles.id })
      .from(creatorProfiles)
      .where(eq(creatorProfiles.username, candidate))
      .limit(1)
      .then((r) => r[0])

    if (!existing) return candidate
    suffix++
    candidate = `${base}${suffix}`
  }
}
