// ─── Users Repository ─────────────────────────────────────────────────────────
// The data-access layer for the users table.
// All raw SQL/Drizzle queries live here; nothing above this layer touches
// the database directly.
//
// Why a repository pattern?
//  - One place to change queries if the schema evolves.
//  - Easy to mock in unit tests (swap the real DB for a fake).
//  - Keeps services clean — they work with plain objects, not query builders.
//
// The 'DATABASE' injection token is provided by DatabaseModule (see database.module.ts).

import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { users } from '../database/schema';
import * as schema from '../database/schema';

// DB is the Drizzle instance type with our schema baked in for type-safety.
type DB = NeonHttpDatabase<typeof schema>;

// User is the TypeScript type for a row from the "users" table.
// $inferSelect derives it automatically from the Drizzle schema definition,
// so it stays in sync whenever the schema changes.
export type User = typeof users.$inferSelect;

// The shape of data we accept when creating or updating a user from Clerk.
// Using an interface (not the full User type) keeps the API surface explicit
// and prevents accidentally passing internal fields like id or createdAt.
export interface UpsertUserData {
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

@Injectable()
export class UsersRepository {
  // @Inject('DATABASE') wires up the Drizzle instance created in DatabaseModule.
  constructor(@Inject('DATABASE') private readonly db: DB) {}

  // Find a single user by their Clerk ID.
  // Returns the first row or null — Drizzle returns an array even for single-row
  // queries, so we take index [0] and fall back to null if nothing matched.
  async findByClerkId(clerkId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    return result[0] ?? null;
  }

  // Find a single user by their internal UUID.
  // Used when referencing users via foreign keys in other tables.
  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  // Insert or update a user row keyed on clerkId.
  // onConflictDoUpdate handles the "user already exists" case:
  //   - If clerkId is new → INSERT a fresh row.
  //   - If clerkId exists → UPDATE the mutable fields in place.
  // sql`now()` calls the database's own clock for updatedAt, keeping it
  // accurate regardless of server timezone or clock drift.
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
        target: users.clerkId, // the unique column that detects conflicts
        set: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          imageUrl: data.imageUrl,
          updatedAt: sql`now()`, // refresh the timestamp on every update
        },
      })
      .returning(); // return the full row after insert/update
    return result[0];
  }

  // Delete the user row matching the given Clerk ID.
  // Called when Clerk fires a "user.deleted" webhook event.
  async deleteByClerkId(clerkId: string): Promise<void> {
    await this.db.delete(users).where(eq(users.clerkId, clerkId));
  }
}
