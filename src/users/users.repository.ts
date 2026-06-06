import { Inject, Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { NeonDatabase } from 'drizzle-orm/neon-serverless'
import {
  users,
  creatorProfiles,
  learnerProfiles,
} from '../database/schema'
import * as schema from '../database/schema'

type DB = NeonDatabase<typeof schema>

export type User = typeof users.$inferSelect
export type CreatorProfile = typeof creatorProfiles.$inferSelect
export type LearnerProfile = typeof learnerProfiles.$inferSelect

export interface UpsertUserData {
  clerkId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  imageUrl?: string | null
  roles?: ('learner' | 'creator')[]
  onboardingComplete?: boolean
}

@Injectable()
export class UsersRepository {
  constructor(@Inject('DATABASE') private readonly db: DB) { }

  // ── Users ──────────────────────────────────────────────

  async findByClerkId(clerkId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1)
    return result[0] ?? null
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return result[0] ?? null
  }

  async upsertFromClerk(data: UpsertUserData): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({
        clerkId: data.clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        imageUrl: data.imageUrl,
        roles: data.roles ?? ['learner'],
        onboardingComplete: data.onboardingComplete ?? false,
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          imageUrl: data.imageUrl,
          updatedAt: new Date(),
          // Never overwrite roles/onboardingComplete here
          // Those are updated only via explicit methods
        },
      })
      .returning()
    return result[0]
  }

  async setOnboardingComplete(userId: string): Promise<User> {
    const result = await this.db
      .update(users)
      .set({ onboardingComplete: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning()
    return result[0]
  }

  async deleteByClerkId(clerkId: string): Promise<void> {
    await this.db.delete(users).where(eq(users.clerkId, clerkId))
  }

  // ── Creator Profiles ───────────────────────────────────

  async findCreatorProfile(userId: string): Promise<CreatorProfile | null> {
    const result = await this.db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, userId))
      .limit(1)
    return result[0] ?? null
  }

  async createCreatorProfile(userId: string): Promise<CreatorProfile> {
    // Generate username from user data
    const user = await this.findById(userId)
    const base = `${user?.firstName ?? 'creator'}${user?.lastName ?? ''}`
      .toLowerCase()
      .replace(/\s+/g, '')
    const suffix = Math.floor(1000 + Math.random() * 9000)
    const username = `${base}${suffix}`

    const result = await this.db
      .insert(creatorProfiles)
      .values({
        userId,
        username,
        displayName: user
          ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
          : null,
        onboardingStatus: 'in_progress',
        currentStep: 1,
      })
      .onConflictDoNothing()
      .returning()
    return result[0] ?? (await this.findCreatorProfile(userId))!
  }

  async updateCreatorStep1(
    userId: string,
    data: {
      displayName: string
      primaryNiche: string
      experienceYears: number
    },
  ): Promise<CreatorProfile> {
    const result = await this.db
      .update(creatorProfiles)
      .set({
        displayName: data.displayName,
        primaryNiche: data.primaryNiche as any,
        experienceYears: data.experienceYears,
        currentStep: 2,
        updatedAt: new Date(),
      })
      .where(eq(creatorProfiles.userId, userId))
      .returning()
    return result[0]
  }

  async updateCreatorStep2(
    userId: string,
    data: {
      bio: string
      photoUrl?: string
      tags: string[]
    },
  ): Promise<CreatorProfile> {
    // All writes atomic — profile update + tag delete + tag insert succeed
    // together or roll back together.
    return this.db.transaction(async (tx) => {
      // Update profile
      const result = await tx
        .update(creatorProfiles)
        .set({
          bio: data.bio,
          profilePhotoUrl: data.photoUrl,
          currentStep: 3,
          updatedAt: new Date(),
        })
        .where(eq(creatorProfiles.userId, userId))
        .returning()

      const profile = result[0]

      // Replace tags — delete existing, insert new
      await tx
        .delete(schema.creatorTags)
        .where(eq(schema.creatorTags.creatorProfileId, profile.id))

      if (data.tags.length > 0) {
        await tx.insert(schema.creatorTags).values(
          data.tags.map((tag) => ({
            creatorProfileId: profile.id,
            tag,
          })),
        )
      }

      return profile
    })
  }

  async updateCreatorStep3GoLive(
    userId: string,
    data: {
      offerType: string
      title: string
      price: number // rupees — we convert to paise
      durationMinutes?: number
    },
  ): Promise<{ profile: CreatorProfile; offeringId: string }> {
    // Idempotency guard — if this creator is already complete and live with a
    // live offering, return the existing data instead of inserting a duplicate.
    // Safe to call multiple times (e.g. retry after a failed Clerk write).
    const existing = await this.findCreatorProfile(userId)
    if (
      existing &&
      existing.onboardingStatus === 'complete' &&
      existing.isLive
    ) {
      const liveOffering = await this.db
        .select()
        .from(schema.offerings)
        .where(
          and(
            eq(schema.offerings.creatorProfileId, existing.id),
            eq(schema.offerings.status, 'live'),
          ),
        )
        .limit(1)
      if (liveOffering[0]) {
        return { profile: existing, offeringId: liveOffering[0].id }
      }
    }

    // Both writes atomic — go-live + first offering succeed together or roll
    // back together. No half-live profile with nothing to sell.
    return this.db.transaction(async (tx) => {
      // Mark profile as live
      const profileResult = await tx
        .update(creatorProfiles)
        .set({
          isLive: true,
          inDiscoveryBoost: true,
          boostEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          onboardingStatus: 'complete',
          currentStep: 3,
          updatedAt: new Date(),
        })
        .where(eq(creatorProfiles.userId, userId))
        .returning()

      const profile = profileResult[0]

      // Create first offering
      const offeringResult = await tx
        .insert(schema.offerings)
        .values({
          creatorProfileId: profile.id,
          type: data.offerType as any,
          title: data.title,
          price: data.price * 100, // rupees to paise
          durationMinutes: data.durationMinutes,
          status: 'live',
        })
        .returning()

      return { profile, offeringId: offeringResult[0].id }
    })
  }

  // ── Learner Profiles ───────────────────────────────────

  async findLearnerProfile(userId: string): Promise<LearnerProfile | null> {
    const result = await this.db
      .select()
      .from(learnerProfiles)
      .where(eq(learnerProfiles.userId, userId))
      .limit(1)
    return result[0] ?? null
  }

  async createLearnerProfile(userId: string): Promise<LearnerProfile> {
    const result = await this.db
      .insert(learnerProfiles)
      .values({
        userId,
        onboardingStatus: 'in_progress',
        currentStep: 1,
      })
      .onConflictDoNothing()
      .returning()
    return result[0] ?? (await this.findLearnerProfile(userId))!
  }

  async updateLearnerStep1(
    userId: string,
    data: {
      goalType: string
    },
  ): Promise<LearnerProfile> {
    const result = await this.db
      .update(learnerProfiles)
      .set({
        goalType: data.goalType as any,
        currentStep: 2,
        updatedAt: new Date(),
      })
      .where(eq(learnerProfiles.userId, userId))
      .returning()
    return result[0]
  }

  // ── Users — identity ───────────────────────────────────

  async updateUserDisplayName(
    userId: string,
    firstName: string,
    lastName?: string,
  ): Promise<User> {
    const result = await this.db
      .update(users)
      .set({
        firstName,
        lastName: lastName ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()
    return result[0]
  }

}