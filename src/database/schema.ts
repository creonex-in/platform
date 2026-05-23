// Drizzle schema — defines all database tables and their column types.
// This file is the single source of truth; run `drizzle-kit generate` to create migrations.
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Local mirror of Clerk user records so we can join them with app data without
// hitting the Clerk API on every request. Kept in sync via Clerk webhooks.
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(), // links this row to the Clerk user
  email: text('email').unique().notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
