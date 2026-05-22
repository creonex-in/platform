// Data-access layer for the users table — all database queries live here.
import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { users } from '../database/schema';
import * as schema from '../database/schema';

type DB = NeonHttpDatabase<typeof schema>;

// Represents a full row from the users table, derived from the Drizzle schema.
export type User = typeof users.$inferSelect;

// Shape of data accepted when syncing a user from Clerk.
export interface UpsertUserData {
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

@Injectable()
export class UsersRepository {
  constructor(@Inject('DATABASE') private readonly db: DB) {}

  // Returns the user matching the given Clerk ID, or null if none exists.
  async findByClerkId(clerkId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    return result[0] ?? null;
  }

  // Returns the user matching the given internal UUID, or null if none exists.
  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  // Inserts a new user or updates the existing one if clerkId already exists.
  async upsertFromClerk(data: UpsertUserData): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({
        clerkId: data.clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        imageUrl: data.imageUrl,
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          imageUrl: data.imageUrl,
          updatedAt: sql`now()`,
        },
      })
      .returning();
    return result[0];
  }

  // Deletes the user row matching the given Clerk ID.
  async deleteByClerkId(clerkId: string): Promise<void> {
    await this.db.delete(users).where(eq(users.clerkId, clerkId));
  }
}
