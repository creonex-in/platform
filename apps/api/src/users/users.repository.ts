import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { user } from '../database/schema'

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findById(id: string) {
    const result = await this.db.select().from(user).where(eq(user.id, id)).limit(1)
    return result[0] ?? null
  }

  async findByEmail(email: string) {
    const result = await this.db.select().from(user).where(eq(user.email, email)).limit(1)
    return result[0] ?? null
  }

  async updateName(userId: string, firstName: string, lastName?: string) {
    await this.db
      .update(user)
      .set({ name: [firstName, lastName].filter(Boolean).join(' ') })
      .where(eq(user.id, userId))
  }

  async updateRole(userId: string, role: string) {
    await this.db.update(user).set({ role }).where(eq(user.id, userId))
  }

  async updatePhone(userId: string, phone: string) {
    await this.db.update(user).set({ phone }).where(eq(user.id, userId))
  }
}
