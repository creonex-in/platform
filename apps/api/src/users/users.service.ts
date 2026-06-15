import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { UsersRepository } from './users.repository'
import { CreatorProfileRepository } from './creator-profile.repository'
import { LearnerProfileRepository } from './learner-profile.repository'
import { parseRoles, type UserRole } from '@creonex/types'
import type { UpdateCreatorProfileDto } from './dto/update-creator-profile.dto'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly creatorRepo: CreatorProfileRepository,
    private readonly learnerRepo: LearnerProfileRepository,
  ) {}

  async getById(id: string) {
    const u = await this.usersRepo.findById(id)
    if (!u) throw new NotFoundException('User not found')
    return u
  }

  async getByEmail(email: string) {
    return this.usersRepo.findByEmail(email)
  }

  async getCreatorProfile(userId: string) {
    const profile = await this.creatorRepo.findByUserId(userId)
    if (!profile) throw new NotFoundException('Creator profile not found')
    return profile
  }

  async getLearnerProfile(userId: string) {
    const profile = await this.learnerRepo.findByUserId(userId)
    if (!profile) throw new NotFoundException('Learner profile not found')
    return profile
  }

  /** Partial update of the creator's own profile (post-onboarding edit). */
  async updateCreatorProfile(userId: string, dto: UpdateCreatorProfileDto) {
    const existing = await this.creatorRepo.findByUserId(userId)
    if (!existing) throw new NotFoundException('Creator profile not found')

    // Username uniqueness — allow the user to keep their own handle.
    if (dto.username !== undefined && dto.username !== existing.username) {
      const ownerId = await this.creatorRepo.findUserIdByUsername(dto.username)
      if (ownerId && ownerId !== userId) {
        throw new ConflictException('That username is already taken')
      }
    }

    // Strip empty social-link values before persisting (same as onboarding).
    let socialLinks: Record<string, string> | undefined
    if (dto.socialLinks) {
      socialLinks = {}
      for (const [key, val] of Object.entries(dto.socialLinks)) {
        if (val) socialLinks[key] = val
      }
    }

    await this.creatorRepo.updateProfile(userId, {
      displayName: dto.displayName,
      username: dto.username,
      bio: dto.bio,
      profilePhotoUrl: dto.profilePhotoUrl,
      coverBannerUrl: dto.coverBannerUrl,
      primaryNiche: dto.primaryNiche,
      experienceYears: dto.experienceYears,
      socialLinks,
      languages: dto.languages,
      tags: dto.tags,
    })

    return this.getCreatorProfile(userId)
  }

  async addCreatorRole(userId: string, currentRole: string) {
    const roles = parseRoles(currentRole)
    const alreadyCreator = roles.includes('creator')

    if (!alreadyCreator) {
      const newRole = [...roles, 'creator'].join(',')
      await this.usersRepo.updateRole(userId, newRole)
    }

    // Always ensure profile exists — idempotent (onConflictDoNothing in repo)
    await this.creatorRepo.create(userId)

    return {
      success: true,
      alreadyCreator,
      roles: alreadyCreator ? roles : ([...roles, 'creator'] as UserRole[]),
      redirectTo: alreadyCreator ? '/dashboard' : '/onboarding/creator/step-1',
    }
  }
}
