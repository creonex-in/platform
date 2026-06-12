import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { learnerProfiles } from '../database/schema'
import { generateId } from '../utils/id'

@Injectable()
export class LearnerProfileRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(learnerProfiles)
      .where(eq(learnerProfiles.userId, userId))
      .limit(1)
    return result[0] ?? null
  }

  async create(userId: string) {
    const [profile] = await this.db
      .insert(learnerProfiles)
      .values({ id: generateId(), userId })
      .onConflictDoNothing()
      .returning()
    return profile ?? null
  }

  async updateStep1(
    userId: string,
    data: { goalType: string; interestedNiches?: string[] },
  ) {
    await this.db
      .update(learnerProfiles)
      .set({
        goalType: data.goalType as typeof learnerProfiles.$inferInsert['goalType'],
        interestedNiches: data.interestedNiches ?? [],
        onboardingStatus: 'complete',
        currentStep: 2,
      })
      .where(eq(learnerProfiles.userId, userId))
  }
}
