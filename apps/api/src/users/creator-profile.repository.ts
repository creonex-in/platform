import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { creatorProfiles, creatorTags } from '../database/schema'
import { generateId } from '../utils/id'

@Injectable()
export class CreatorProfileRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, userId))
      .limit(1)
    return result[0] ?? null
  }

  async create(userId: string) {
    const [profile] = await this.db
      .insert(creatorProfiles)
      .values({ id: generateId(), userId })
      .onConflictDoNothing()
      .returning()
    return profile ?? null
  }

  async updateStep1(
    userId: string,
    data: { displayName: string; primaryNiche: string; experienceYears: number },
  ) {
    await this.db
      .update(creatorProfiles)
      .set({
        displayName: data.displayName,
        primaryNiche: data.primaryNiche as typeof creatorProfiles.$inferInsert['primaryNiche'],
        experienceYears: data.experienceYears,
        onboardingStatus: 'in_progress',
        currentStep: 2,
      })
      .where(eq(creatorProfiles.userId, userId))
  }

  async updateQuestions(
    userId: string,
    data: {
      displayName: string
      nicheCategory: string
      credentialType: string
      audienceType: string
      primaryPlatform: string
      creatorGoal: string
    },
  ) {
    await this.db
      .update(creatorProfiles)
      .set({
        displayName: data.displayName,
        nicheCategory: data.nicheCategory,
        credentialType: data.credentialType,
        audienceType: data.audienceType,
        primaryPlatform: data.primaryPlatform,
        creatorGoal: data.creatorGoal,
        onboardingStatus: 'in_progress',
        currentStep: 2,
      })
      .where(eq(creatorProfiles.userId, userId))
  }

  async updateStep2(
    userId: string,
    data: {
      bio: string
      tags: string[]
      photoUrl?: string
      socialLinks?: Record<string, string | undefined>
    },
  ) {
    await this.db
      .update(creatorProfiles)
      .set({
        bio: data.bio,
        profilePhotoUrl: data.photoUrl ?? null,
        socialLinks: data.socialLinks ?? {},
        onboardingStatus: 'in_progress',
        currentStep: 3,
      })
      .where(eq(creatorProfiles.userId, userId))

    // Replace tags: delete existing then insert new ones
    const profile = await this.db
      .select({ id: creatorProfiles.id })
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, userId))
      .limit(1)
      .then((r) => r[0])

    if (!profile) return

    await this.db.delete(creatorTags).where(eq(creatorTags.creatorProfileId, profile.id))

    if (data.tags.length > 0) {
      await this.db.insert(creatorTags).values(
        data.tags.map((tag) => ({ id: generateId(), creatorProfileId: profile.id, tag })),
      )
    }
  }

  async updateStep3(
    userId: string,
    data: { bannerUrl?: string; languages: string[] },
  ) {
    await this.db
      .update(creatorProfiles)
      .set({
        coverBannerUrl: data.bannerUrl ?? null,
        languages: data.languages,
        onboardingStatus: 'in_progress',
        currentStep: 4,
      })
      .where(eq(creatorProfiles.userId, userId))
  }

  async goLive(
    userId: string,
    username: string,
    boostEndDate: Date,
  ) {
    await this.db
      .update(creatorProfiles)
      .set({
        username,
        isLive: true,
        inDiscoveryBoost: true,
        boostEndDate,
        onboardingStatus: 'complete',
        currentStep: 4,
      })
      .where(eq(creatorProfiles.userId, userId))
  }

  async findPublicByUsername(username: string) {
    const profile = await this.db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.username, username))
      .limit(1)
      .then((r) => r[0] ?? null)
    if (!profile) return null
    const tags = await this.db
      .select({ tag: creatorTags.tag })
      .from(creatorTags)
      .where(eq(creatorTags.creatorProfileId, profile.id))
    return { ...profile, tags: tags.map((t) => t.tag) }
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const result = await this.db
      .select({ id: creatorProfiles.id })
      .from(creatorProfiles)
      .where(eq(creatorProfiles.username, username))
      .limit(1)
    return result.length > 0
  }
}
