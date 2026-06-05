import { Injectable, Inject } from '@nestjs/common'
import { createClerkClient } from '@clerk/backend'
import { UsersService } from '../users/users.service'
import { ClerkPublicMetadata } from '../users/webhook-events.types'
import {
  LearnerStep1Dto,
  CreatorStep1Dto,
  CreatorStep2Dto,
  CreatorStep3Dto,
} from './onboarding.dto'

type ClerkClient = ReturnType<typeof createClerkClient>

@Injectable()
export class OnboardingService {
  constructor(
    private readonly usersService: UsersService,
    @Inject('CLERK_CLIENT') private readonly clerkClient: ClerkClient,
  ) {}

  // ── Learner ──────────────────────────────────────────

  async saveLearnerStep1(
    userId: string,
    clerkUserId: string,
    dto: LearnerStep1Dto,
  ): Promise<{ success: true; redirectTo: string }> {
    // 1. Save goalType to learner profile
    await this.usersService.updateLearnerStep1(userId, { goalType: dto.goalType })

    // 2. Update Clerk — spread existing metadata, mark complete
    const clerkUser = await this.clerkClient.users.getUser(clerkUserId)
    const existingMeta = (clerkUser.publicMetadata ?? {}) as Partial<ClerkPublicMetadata>
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        ...existingMeta,
        onboarding_complete: true,
        onboarding_step: 1,
      },
    })

    // 3. Mirror to DB
    await this.usersService.setOnboardingComplete(userId)

    return { success: true, redirectTo: '/explore' }
  }

  // ── Creator ──────────────────────────────────────────

  async saveCreatorStep1(
    userId: string,
    clerkUserId: string,
    dto: CreatorStep1Dto,
  ): Promise<{ success: true; nextStep: number }> {
    // 1. Save to creator profile
    await this.usersService.updateCreatorStep1(userId, {
      displayName: dto.fullName,
      primaryNiche: dto.primaryNiche,
      experienceYears: dto.experienceYears,
    })

    // 2. Update Clerk — spread existing metadata
    const clerkUser = await this.clerkClient.users.getUser(clerkUserId)
    const existingMeta = (clerkUser.publicMetadata ?? {}) as Partial<ClerkPublicMetadata>
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { ...existingMeta, onboarding_step: 2 },
    })

    // 3. Mirror to DB
    await this.usersService.updateOnboardingStep(userId, 2)

    return { success: true, nextStep: 2 }
  }

  async saveCreatorStep2(
    userId: string,
    clerkUserId: string,
    dto: CreatorStep2Dto,
  ): Promise<{ success: true; nextStep: number }> {
    // 1. Update creator profile bio + photo
    // 2. Delete existing tags + insert new ones (handled inside updateCreatorStep2)
    await this.usersService.updateCreatorStep2(userId, {
      bio: dto.bio,
      photoUrl: dto.photoUrl,
      tags: dto.tags,
    })

    // 3. Update Clerk — spread existing metadata
    const clerkUser = await this.clerkClient.users.getUser(clerkUserId)
    const existingMeta = (clerkUser.publicMetadata ?? {}) as Partial<ClerkPublicMetadata>
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { ...existingMeta, onboarding_step: 3 },
    })

    // 4. Mirror to DB
    await this.usersService.updateOnboardingStep(userId, 3)

    return { success: true, nextStep: 3 }
  }

  async saveCreatorStep3GoLive(
    userId: string,
    clerkUserId: string,
    dto: CreatorStep3Dto,
  ): Promise<{
    success: true
    username: string | null
    profileUrl: string
    qualityScore: string
    offeringId: string
  }> {
    // 1 + 2. Go live + create first offering (handled inside updateCreatorStep3GoLive)
    const { profile, offeringId } = await this.usersService.updateCreatorStep3GoLive(userId, {
      offerType: dto.offerType,
      title: dto.title,
      price: dto.price,
      durationMinutes: dto.durationMinutes,
    })

    // 3. Update Clerk — spread existing metadata, mark complete
    const clerkUser = await this.clerkClient.users.getUser(clerkUserId)
    const existingMeta = (clerkUser.publicMetadata ?? {}) as Partial<ClerkPublicMetadata>
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        ...existingMeta,
        onboarding_complete: true,
        onboarding_step: 3,
      },
    })

    // 4. Mirror to DB
    await this.usersService.setOnboardingComplete(userId)

    return {
      success: true,
      username: profile.username,
      profileUrl: profile.username ? `creonex.in/${profile.username}` : '',
      qualityScore: profile.qualityScore,
      offeringId,
    }
  }
}
