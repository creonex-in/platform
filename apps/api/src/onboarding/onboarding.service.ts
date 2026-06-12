import { Injectable, BadRequestException } from '@nestjs/common'
import { UsersRepository } from '../users/users.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import { LearnerProfileRepository } from '../users/learner-profile.repository'
import { OfferingsRepository } from '../users/offerings.repository'
import type { LearnerStep1Dto, CreatorStep1Dto, CreatorStep2Dto, CreatorStep3Dto } from './onboarding.dto'

const DISCOVERY_BOOST_DAYS = 14

@Injectable()
export class OnboardingService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly creatorRepo: CreatorProfileRepository,
    private readonly learnerRepo: LearnerProfileRepository,
    private readonly offeringsRepo: OfferingsRepository,
  ) {}

  async saveLearnerStep1(userId: string, dto: LearnerStep1Dto) {
    if (dto.fullName) {
      const [firstName, ...rest] = dto.fullName.trim().split(' ')
      await this.usersRepo.updateName(userId, firstName!, rest.join(' ') || undefined)
    }

    const existing = await this.learnerRepo.findByUserId(userId)
    if (!existing) await this.learnerRepo.create(userId)

    await this.learnerRepo.updateStep1(userId, {
      goalType: dto.goalType,
      interestedNiches: dto.interestedNiches ?? [],
    })

    return { success: true }
  }

  async saveCreatorStep1(userId: string, dto: CreatorStep1Dto) {
    const [firstName, ...rest] = dto.fullName.trim().split(' ')
    await this.usersRepo.updateName(userId, firstName!, rest.join(' ') || undefined)

    const existing = await this.creatorRepo.findByUserId(userId)
    if (!existing) await this.creatorRepo.create(userId)

    await this.creatorRepo.updateStep1(userId, {
      displayName: dto.fullName,
      primaryNiche: dto.primaryNiche,
      experienceYears: dto.experienceYears,
    })

    return { success: true, nextStep: 2 }
  }

  async saveCreatorStep2(userId: string, dto: CreatorStep2Dto) {
    const profile = await this.creatorRepo.findByUserId(userId)
    if (!profile) throw new BadRequestException('Complete step 1 first')

    await this.creatorRepo.updateStep2(userId, {
      bio: dto.bio,
      tags: dto.tags,
      photoUrl: dto.photoUrl,
    })

    return { success: true, nextStep: 3 }
  }

  async saveCreatorStep3(userId: string, dto: CreatorStep3Dto) {
    const profile = await this.creatorRepo.findByUserId(userId)
    if (!profile) throw new BadRequestException('Complete step 1 first')
    if ((profile.currentStep ?? 1) < 3) {
      throw new BadRequestException('Complete previous steps first')
    }

    // Idempotent: if already live, return existing state
    if (profile.isLive) {
      const existingOffer = await this.offeringsRepo.findFirstByCreatorProfileId(profile.id)
      return {
        success: true,
        username: profile.username,
        profileUrl: `/c/${profile.username}`,
        offeringId: existingOffer?.id,
        redirectTo: '/dashboard',
      }
    }

    const priceInPaise = dto.price * 100
    const boostEndDate = new Date()
    boostEndDate.setDate(boostEndDate.getDate() + DISCOVERY_BOOST_DAYS)
    const username = await this.generateUsername(profile.displayName ?? '')

    const offeringId = await this.offeringsRepo.create({
      creatorProfileId: profile.id,
      type: dto.offerType,
      title: dto.title,
      priceInPaise,
      durationMinutes: dto.durationMinutes,
      seatsTotal: dto.seatsTotal,
    })

    await this.creatorRepo.goLive(userId, username, boostEndDate)

    return {
      success: true,
      username,
      profileUrl: `/c/${username}`,
      offeringId,
      redirectTo: '/dashboard',
    }
  }

  private async generateUsername(displayName: string): Promise<string> {
    const base = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'creator'
    let candidate = base
    let suffix = 0

    while (await this.creatorRepo.isUsernameTaken(candidate)) {
      suffix++
      candidate = `${base}${suffix}`
    }

    return candidate
  }
}
