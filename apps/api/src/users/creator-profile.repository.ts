import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { creatorProfiles, creatorTags } from '../database/schema'
import { generateId } from '../utils/id'

@Injectable()
export class CreatorProfileRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findByUserId(userId: string) {
    const profile = await this.db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, userId))
      .limit(1)
      .then((r) => r[0] ?? null)
    if (!profile) return null
    const tags = await this.db
      .select({ tag: creatorTags.tag })
      .from(creatorTags)
      .where(eq(creatorTags.creatorProfileId, profile.id))
    return { ...profile, tags: tags.map((t) => t.tag) }
  }

  async findById(id: string) {
    return this.db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.id, id))
      .limit(1)
      .then((r) => r[0] ?? null)
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
    data: {
      displayName: string
      username: string
      primaryNiche: string
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
        username: data.username,
        primaryNiche: data.primaryNiche as typeof creatorProfiles.$inferInsert['primaryNiche'],
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
      experienceYears?: number
    },
  ) {
    await this.db
      .update(creatorProfiles)
      .set({
        bio: data.bio,
        profilePhotoUrl: data.photoUrl ?? null,
        socialLinks: data.socialLinks ?? {},
        experienceYears: data.experienceYears ?? null,
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

  /**
   * Partial profile update for post-onboarding edits. Writes only the provided
   * columns and never touches onboardingStatus/currentStep/isLive. When `tags`
   * is provided it replaces the tag set (delete + insert), like updateStep2.
   */
  async updateProfile(
    userId: string,
    data: {
      displayName?: string
      username?: string
      bio?: string
      profilePhotoUrl?: string | null
      coverBannerUrl?: string | null
      primaryNiche?: string
      experienceYears?: number | null
      socialLinks?: Record<string, string>
      languages?: string[]
      tags?: string[]
    },
  ) {
    const set: Partial<typeof creatorProfiles.$inferInsert> = {}
    if (data.displayName !== undefined) set.displayName = data.displayName
    if (data.username !== undefined) set.username = data.username
    if (data.bio !== undefined) set.bio = data.bio
    if (data.profilePhotoUrl !== undefined) set.profilePhotoUrl = data.profilePhotoUrl
    if (data.coverBannerUrl !== undefined) set.coverBannerUrl = data.coverBannerUrl
    if (data.primaryNiche !== undefined) {
      set.primaryNiche = data.primaryNiche as typeof creatorProfiles.$inferInsert['primaryNiche']
    }
    if (data.experienceYears !== undefined) set.experienceYears = data.experienceYears
    if (data.socialLinks !== undefined) set.socialLinks = data.socialLinks
    if (data.languages !== undefined) set.languages = data.languages

    if (Object.keys(set).length > 0) {
      await this.db.update(creatorProfiles).set(set).where(eq(creatorProfiles.userId, userId))
    }

    if (data.tags !== undefined) {
      const profile = await this.db
        .select({ id: creatorProfiles.id })
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, userId))
        .limit(1)
        .then((r) => r[0])
      if (profile) {
        await this.db.delete(creatorTags).where(eq(creatorTags.creatorProfileId, profile.id))
        if (data.tags.length > 0) {
          await this.db.insert(creatorTags).values(
            data.tags.map((tag) => ({ id: generateId(), creatorProfileId: profile.id, tag })),
          )
        }
      }
    }
  }

  async findByRazorpayAccountId(razorpayAccountId: string) {
    return this.db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.razorpayAccountId, razorpayAccountId))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  /** Update Razorpay Route / KYC fields on the creator profile. */
  async updatePayoutFields(
    creatorProfileId: string,
    data: { razorpayAccountId?: string; kycStatus?: string; payoutsEnabled?: boolean },
  ) {
    const set: Partial<typeof creatorProfiles.$inferInsert> = {}
    if (data.razorpayAccountId !== undefined) set.razorpayAccountId = data.razorpayAccountId
    if (data.kycStatus !== undefined) {
      set.kycStatus = data.kycStatus as typeof creatorProfiles.$inferInsert['kycStatus']
    }
    if (data.payoutsEnabled !== undefined) set.payoutsEnabled = data.payoutsEnabled
    if (Object.keys(set).length === 0) return
    await this.db.update(creatorProfiles).set(set).where(eq(creatorProfiles.id, creatorProfileId))
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

  /** Returns the userId owning a username, or null if free. Lets callers
   *  treat a user's own reserved handle as available to themselves. */
  async findUserIdByUsername(username: string): Promise<string | null> {
    const result = await this.db
      .select({ userId: creatorProfiles.userId })
      .from(creatorProfiles)
      .where(eq(creatorProfiles.username, username))
      .limit(1)
    return result[0]?.userId ?? null
  }
}
