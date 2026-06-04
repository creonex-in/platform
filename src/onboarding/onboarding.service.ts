import { Injectable, Inject } from '@nestjs/common'
import { createClerkClient } from '@clerk/backend'
import { UsersService } from '../users/users.service'
import {
  LearnerStep1Dto,
  LearnerStep2Dto,
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
  ) { }

  // ── Learner ──────────────────────────────────────────

  async saveLearnerStep1(userId: string, clerkUserId: string, dto: LearnerStep1Dto) {
    // Clerk first — authority; DB mirrors
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { onboarding_step: 2 },
    })

    await this.usersService.updateLearnerStep1(userId, { goalType: dto.goalType })
    await this.usersService.updateOnboardingStep(userId, 2)

    return { success: true, nextStep: 2 }
  }

  async saveLearnerStep2(userId: string, clerkUserId: string, dto: LearnerStep2Dto) {
    // Clerk first
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { onboarding_complete: true, onboarding_step: 2 },
    })

    await this.usersService.updateLearnerStep2(userId, {
      niches: dto.niches,
      budgetRange: dto.budgetRange,
    })
    await this.usersService.setOnboardingComplete(userId)

    return { success: true, redirectTo: '/dashboard/learner' }
  }

  // ── Creator ──────────────────────────────────────────

  async saveCreatorStep1(userId: string, clerkUserId: string, dto: CreatorStep1Dto) {
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { onboarding_step: 2 },
    })

    await this.usersService.updateCreatorStep1(userId, {
      displayName: dto.fullName,
      primaryNiche: dto.primaryNiche,
      experienceYears: dto.experienceYears,
    })
    await this.usersService.updateOnboardingStep(userId, 2)

    return { success: true, nextStep: 2 }
  }

  async saveCreatorStep2(userId: string, clerkUserId: string, dto: CreatorStep2Dto) {
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { onboarding_step: 3 },
    })

    await this.usersService.updateCreatorStep2(userId, {
      bio: dto.bio,
      photoUrl: dto.photoUrl,
      tags: dto.tags,
    })
    await this.usersService.updateOnboardingStep(userId, 3)

    return { success: true, nextStep: 3 }
  }

  async saveCreatorStep3GoLive(
    userId: string,
    clerkUserId: string,
    dto: CreatorStep3Dto,
  ) {
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { onboarding_complete: true, onboarding_step: 3 },
    })

    const { profile, offeringId } =
      await this.usersService.updateCreatorStep3GoLive(userId, {
        offerType: dto.offerType,
        title: dto.title,
        price: dto.price,
        durationMinutes: dto.durationMinutes,
      })
    await this.usersService.setOnboardingComplete(userId)

    return {
      success: true,
      username: profile.username,
      profileUrl: profile.username ? `creonex.in/${profile.username}` : null,
      qualityScore: profile.qualityScore,
      offeringId,
    }
  }
}
