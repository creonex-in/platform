import { Injectable, NotFoundException } from '@nestjs/common'
import { UsersRepository } from './users.repository'
import { CreatorProfileRepository } from './creator-profile.repository'
import { LearnerProfileRepository } from './learner-profile.repository'
import { parseRoles, type UserRole } from '@creonex/types'

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
