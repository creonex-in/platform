import { Injectable, NotFoundException } from '@nestjs/common'
import { UsersRepository } from './users.repository'
import type { UserRole } from '@creonex/types'
import { parseRoles } from '@creonex/types'

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async getById(id: string) {
    const u = await this.repo.findById(id)
    if (!u) throw new NotFoundException('User not found')
    return u
  }

  async getByEmail(email: string) {
    return this.repo.findByEmail(email)
  }

  async getLearnerProfile(userId: string) {
    const profile = await this.repo.getLearnerProfile(userId)
    if (!profile) throw new NotFoundException('Learner profile not found')
    return profile
  }

  async getCreatorProfile(userId: string) {
    const profile = await this.repo.getCreatorProfile(userId)
    if (!profile) throw new NotFoundException('Creator profile not found')
    return profile
  }

  async ensureLearnerProfile(userId: string) {
    const existing = await this.repo.getLearnerProfile(userId)
    if (existing) return existing
    return this.repo.createLearnerProfile(userId)
  }

  async ensureCreatorProfile(userId: string) {
    const existing = await this.repo.getCreatorProfile(userId)
    if (existing) return existing
    return this.repo.createCreatorProfile(userId)
  }

  parseRoles(roleString: string): UserRole[] {
    return parseRoles(roleString)
  }

  async addCreatorRole(userId: string, currentRole: string) {
    const roles = parseRoles(currentRole)
    if (roles.includes('creator')) {
      return { success: true, alreadyCreator: true, roles, redirectTo: '/dashboard' }
    }
    const newRole = [...roles, 'creator'].join(',') as string
    await this.repo.updateUserRole(userId, newRole)
    await this.repo.createCreatorProfile(userId)
    return {
      success: true,
      alreadyCreator: false,
      roles: parseRoles(newRole),
      redirectTo: '/onboarding/creator/step-1',
    }
  }
}
