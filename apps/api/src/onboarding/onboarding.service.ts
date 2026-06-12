import { Injectable, BadRequestException } from '@nestjs/common'
import { UsersRepository } from '../users/users.repository'
import type { LearnerStep1Dto, CreatorStep1Dto, CreatorStep2Dto, CreatorStep3Dto, CreatorQuestionsDto } from './onboarding.dto'

@Injectable()
export class OnboardingService {
  constructor(private readonly repo: UsersRepository) {}

  async saveLearnerStep1(userId: string, dto: LearnerStep1Dto) {
    if (dto.fullName) {
      const [firstName, ...rest] = dto.fullName.trim().split(' ')
      await this.repo.updateUserName(userId, firstName!, rest.join(' ') || undefined)
    }

    let profile = await this.repo.getLearnerProfile(userId)
    if (!profile) {
      profile = await this.repo.createLearnerProfile(userId)
    }

    await this.repo.updateLearnerStep1(userId, {
      goalType: dto.goalType,
      interestedNiches: dto.interestedNiches ?? [],
    })

    return { success: true }
  }

  async saveCreatorStep1(userId: string, dto: CreatorStep1Dto) {
    const [firstName, ...rest] = dto.fullName.trim().split(' ')
    const lastName = rest.join(' ') || undefined

    await this.repo.updateUserName(userId, firstName!, lastName)

    let profile = await this.repo.getCreatorProfile(userId)
    if (!profile) {
      profile = await this.repo.createCreatorProfile(userId)
    }

    await this.repo.updateCreatorStep1(userId, {
      displayName: dto.fullName,
      primaryNiche: dto.primaryNiche,
      experienceYears: dto.experienceYears,
    })

    return { success: true, nextStep: 2 }
  }

  async saveCreatorStep2(userId: string, dto: CreatorStep2Dto) {
    const profile = await this.repo.getCreatorProfile(userId)
    if (!profile) throw new BadRequestException('Complete step 1 first')

    await this.repo.updateCreatorStep2(userId, {
      bio: dto.bio,
      tags: dto.tags,
      photoUrl: dto.photoUrl,
    })

    return { success: true, nextStep: 3 }
  }

  async saveCreatorStep3(userId: string, dto: CreatorStep3Dto) {
    const profile = await this.repo.getCreatorProfile(userId)
    if (!profile) throw new BadRequestException('Complete step 1 first')
    if ((profile.currentStep ?? 1) < 3)
      throw new BadRequestException('Complete previous steps first')

    const result = await this.repo.updateCreatorStep3GoLive(userId, {
      offerType: dto.offerType,
      title: dto.title,
      price: dto.price,
      durationMinutes: dto.durationMinutes,
      seatsTotal: dto.seatsTotal,
    })

    return {
      success: true,
      username: result.profile.username,
      profileUrl: `/c/${result.profile.username}`,
      offeringId: result.offeringId,
      redirectTo: '/dashboard',
    }
  }

  async saveCreatorQuestions(userId: string, dto: CreatorQuestionsDto) {
    const [firstName, ...rest] = dto.fullName.trim().split(' ')
    await this.repo.updateUserName(userId, firstName!, rest.join(' ') || undefined)

    let profile = await this.repo.getCreatorProfile(userId)
    if (!profile) {
      profile = await this.repo.createCreatorProfile(userId)
    }

    await this.repo.updateCreatorQuestions(userId, {
      displayName: dto.fullName,
      nicheCategory: dto.nicheCategory,
      credentialType: dto.credentialType,
      audienceType: dto.audienceType,
      primaryPlatform: dto.primaryPlatform,
      creatorGoal: dto.creatorGoal,
      socialLinks: dto.socialLinks,
    })

    return { success: true, nextStep: 2 }
  }
}
