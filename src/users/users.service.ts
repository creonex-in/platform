import { Injectable } from '@nestjs/common'
import {
  UpsertUserData,
  User,
  CreatorProfile,
  LearnerProfile,
  UsersRepository,
} from './users.repository'

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) { }

  async getByClerkId(clerkId: string): Promise<User | null> {
    return this.repo.findByClerkId(clerkId)
  }

  async getById(id: string): Promise<User | null> {
    return this.repo.findById(id)
  }

  async upsertFromClerk(data: UpsertUserData): Promise<User> {
    return this.repo.upsertFromClerk(data)
  }

  async deleteByClerkId(clerkId: string): Promise<void> {
    return this.repo.deleteByClerkId(clerkId)
  }

  async setOnboardingComplete(userId: string): Promise<User> {
    return this.repo.setOnboardingComplete(userId)
  }

  async updateUserDisplayName(
    userId: string,
    firstName: string,
    lastName?: string,
  ): Promise<User> {
    return this.repo.updateUserDisplayName(userId, firstName, lastName)
  }

  // Creator profile methods
  async createCreatorProfile(userId: string): Promise<CreatorProfile> {
    return this.repo.createCreatorProfile(userId)
  }

  async getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
    return this.repo.findCreatorProfile(userId)
  }

  async updateCreatorStep1(
    userId: string,
    data: { displayName: string; primaryNiche: string; experienceYears: number },
  ): Promise<CreatorProfile> {
    return this.repo.updateCreatorStep1(userId, data)
  }

  async updateCreatorStep2(
    userId: string,
    data: { bio: string; photoUrl?: string; tags: string[] },
  ): Promise<CreatorProfile> {
    return this.repo.updateCreatorStep2(userId, data)
  }

  async updateCreatorStep3GoLive(
    userId: string,
    data: {
      offerType: string
      title: string
      price: number
      durationMinutes?: number
    },
  ): Promise<{ profile: CreatorProfile; offeringId: string }> {
    return this.repo.updateCreatorStep3GoLive(userId, data)
  }

  // Learner profile methods
  async createLearnerProfile(userId: string): Promise<LearnerProfile> {
    return this.repo.createLearnerProfile(userId)
  }

  async getLearnerProfile(userId: string): Promise<LearnerProfile | null> {
    return this.repo.findLearnerProfile(userId)
  }

  async updateLearnerStep1(
    userId: string,
    data: { goalType: string },
  ): Promise<LearnerProfile> {
    return this.repo.updateLearnerStep1(userId, data)
  }

}