import { Injectable, Inject } from '@nestjs/common'
import { createClerkClient } from '@clerk/backend'
import { UsersService } from '../users/users.service'
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

    // 2. Save name to users table (identity data) — split on first space
    const trimmed = dto.fullName.trim()
    const spaceIdx = trimmed.indexOf(' ')
    const firstName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)
    const lastName =
      spaceIdx === -1 ? undefined : trimmed.slice(spaceIdx + 1).trim()
    await this.usersService.updateUserDisplayName(userId, firstName, lastName)

    // 3. Mark complete in DB (mirror) BEFORE Clerk — if Clerk fails, retry is
    //    safe because the DB is already correct and steps 1-3 are idempotent.
    await this.usersService.setOnboardingComplete(userId)

    // 4. Update Clerk LAST (authority). updateUserMetadata is a merge — it only
    //    touches the fields passed, so no read-then-spread is needed.
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        onboarding_complete: true,
        onboarding_step: 1,
      },
    })

    return { success: true, redirectTo: '/learner/dashboard' }
  }

  // ── Creator ──────────────────────────────────────────

  async saveCreatorStep1(
    userId: string,
    clerkUserId: string,
    dto: CreatorStep1Dto,
  ): Promise<{ success: true; nextStep: number }> {
    // 1. Save to creator profile (currentStep advanced inside the repo method)
    await this.usersService.updateCreatorStep1(userId, {
      displayName: dto.fullName,
      primaryNiche: dto.primaryNiche,
      experienceYears: dto.experienceYears,
    })

    // 2. Update Clerk — merge only
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { onboarding_step: 2 },
    })

    return { success: true, nextStep: 2 }
  }

  async saveCreatorStep2(
    userId: string,
    clerkUserId: string,
    dto: CreatorStep2Dto,
  ): Promise<{ success: true; nextStep: number }> {
    // 1. Update creator profile bio + photo + tags (transactional in repo)
    await this.usersService.updateCreatorStep2(userId, {
      bio: dto.bio,
      photoUrl: dto.photoUrl,
      tags: dto.tags,
    })

    // 2. Update Clerk — merge only
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { onboarding_step: 3 },
    })

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
    // 1. Go live + create first offering (transactional + idempotent in repo)
    const { profile, offeringId } = await this.usersService.updateCreatorStep3GoLive(userId, {
      offerType: dto.offerType,
      title: dto.title,
      price: dto.price,
      durationMinutes: dto.durationMinutes,
    })

    // 2. Mark complete in DB (mirror) BEFORE Clerk — retry-safe on Clerk failure.
    await this.usersService.setOnboardingComplete(userId)

    // 3. Update Clerk LAST (authority) — merge only.
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        onboarding_complete: true,
        onboarding_step: 3,
      },
    })

    return {
      success: true,
      username: profile.username,
      profileUrl: profile.username ? `creonex.in/${profile.username}` : '',
      qualityScore: profile.qualityScore,
      offeringId,
    }
  }
}
