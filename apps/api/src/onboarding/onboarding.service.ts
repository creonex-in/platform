import { Injectable, BadRequestException } from '@nestjs/common'
import { normalizeUsername, validateUsername } from '@creonex/types'
import { UsersRepository } from '../users/users.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import { LearnerProfileRepository } from '../users/learner-profile.repository'
import { OfferingsRepository } from '../users/offerings.repository'
import { SchedulesRepository } from '../availability/schedules.repository'
import type { LearnerStep1Dto, CreatorStep1Dto, CreatorStep2Dto, CreatorStep3Dto, CreatorStep4Dto } from './onboarding.dto'

const DISCOVERY_BOOST_DAYS = 14

@Injectable()
export class OnboardingService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly creatorRepo: CreatorProfileRepository,
    private readonly learnerRepo: LearnerProfileRepository,
    private readonly offeringsRepo: OfferingsRepository,
    private readonly schedulesRepo: SchedulesRepository,
  ) {}

  /** Split a full name into first + (optional) last. */
  private splitFullName(fullName: string): { first: string; last?: string } {
    const [first, ...rest] = fullName.trim().split(/\s+/)
    return { first: first ?? '', last: rest.join(' ') || undefined }
  }

  /**
   * Load the creator profile and assert the user has reached `minStep`.
   * Throws 400 if the profile is missing or earlier steps are incomplete.
   */
  private async loadCreatorAtStep(userId: string, minStep: number) {
    const profile = await this.creatorRepo.findByUserId(userId)
    if (!profile) throw new BadRequestException('Complete step 1 first')
    if ((profile.currentStep ?? 1) < minStep) {
      throw new BadRequestException('Complete previous steps first')
    }
    return profile
  }

  async saveLearnerStep1(userId: string, dto: LearnerStep1Dto) {
    if (dto.fullName) {
      const { first, last } = this.splitFullName(dto.fullName)
      await this.usersRepo.updateName(userId, first, last)
    }

    const existing = await this.learnerRepo.findByUserId(userId)
    if (!existing) await this.learnerRepo.create(userId)

    await this.learnerRepo.updateStep1(userId, {
      goalType: dto.goalType,
      interestedNiches: dto.interestedNiches ?? [],
    })

    return { success: true }
  }

  /** Live availability for step-1. A user's own reserved handle counts as free. */
  async checkUsernameAvailability(userId: string, raw: string) {
    const username = normalizeUsername(raw ?? '')
    const formatError = validateUsername(username)
    if (formatError) return { available: false, reason: formatError }

    const ownerId = await this.creatorRepo.findUserIdByUsername(username)
    if (ownerId && ownerId !== userId) return { available: false, reason: 'Already taken' }
    return { available: true }
  }

  async saveCreatorStep1(userId: string, dto: CreatorStep1Dto) {
    const username = normalizeUsername(dto.username)
    const { available, reason } = await this.checkUsernameAvailability(userId, username)
    if (!available) throw new BadRequestException(reason ?? 'Username unavailable')

    const { first, last } = this.splitFullName(dto.fullName)
    await this.usersRepo.updateName(userId, first, last)

    const existing = await this.creatorRepo.findByUserId(userId)
    if (!existing) await this.creatorRepo.create(userId)

    await this.creatorRepo.updateStep1(userId, {
      displayName: dto.fullName,
      username,
      primaryNiche: dto.primaryNiche,
      credentialType: dto.credentialType,
      audienceType: dto.audienceType,
      primaryPlatform: dto.primaryPlatform,
      creatorGoal: dto.creatorGoal,
    })

    return { success: true, nextStep: 2 }
  }

  async saveCreatorStep2(userId: string, dto: CreatorStep2Dto) {
    await this.loadCreatorAtStep(userId, 2)

    // Strip empty strings from socialLinks before persisting
    const socialLinks: Record<string, string> = {}
    if (dto.socialLinks) {
      for (const [key, val] of Object.entries(dto.socialLinks)) {
        if (val) socialLinks[key] = val
      }
    }

    await this.creatorRepo.updateStep2(userId, {
      bio: dto.bio,
      tags: dto.tags,
      photoUrl: dto.photoUrl,
      socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      experienceYears: dto.experienceYears,
    })

    return { success: true, nextStep: 3 }
  }

  async saveCreatorStep3(userId: string, dto: CreatorStep3Dto) {
    await this.loadCreatorAtStep(userId, 3)

    await this.creatorRepo.updateStep3(userId, {
      bannerUrl: dto.bannerUrl,
      languages: dto.languages,
    })

    return { success: true, nextStep: 4 }
  }

  async saveCreatorStep4(userId: string, dto: CreatorStep4Dto) {
    const profile = await this.loadCreatorAtStep(userId, 4)

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

    const username = profile.username
    if (!username) {
      throw new BadRequestException('Choose a username in step 1 before going live')
    }

    const priceInPaise = dto.price * 100
    const boostEndDate = new Date()
    boostEndDate.setDate(boostEndDate.getDate() + DISCOVERY_BOOST_DAYS)

    // Create a default schedule (+ one rule per enabled day) so the offering is
    // bookable immediately. Slot generation falls back to the creator's default
    // schedule when an offering has no explicit scheduleId — we link it too.
    let scheduleId: string | undefined
    if (dto.availability && dto.availability.days.length > 0) {
      scheduleId = await this.schedulesRepo.create({
        creatorProfileId: profile.id,
        name: 'Working Hours',
        timezone: dto.availability.timezone,
        isDefault: true,
      })
      for (const day of dto.availability.days) {
        await this.schedulesRepo.addRule(scheduleId, {
          rrule: `FREQ=WEEKLY;BYDAY=${day.day}`,
          startTime: day.startTime,
          endTime: day.endTime,
        })
      }
    }

    const offeringId = await this.offeringsRepo.create({
      creatorProfileId: profile.id,
      type: dto.offerType,
      title: dto.title,
      description: dto.description,
      priceInPaise,
      durationMinutes: dto.durationMinutes,
      seatsTotal: dto.seatsTotal,
      scheduleId,
    })

    await this.creatorRepo.goLive(userId, username, boostEndDate)

    return {
      success: true,
      username,
      profileUrl: `/c/${username}`,
      offeringId,
      redirectTo: `/dashboard?welcome=1&offer=${offeringId}`,
    }
  }
}
