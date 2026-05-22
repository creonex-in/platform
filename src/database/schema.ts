// ─── Database Schema ──────────────────────────────────────────────────────────
// Defines all database tables using Drizzle ORM's schema builder.
// This file is the single source of truth for the database structure —
// Drizzle uses it to generate migrations (via `drizzle-kit generate`) and to
// provide TypeScript types for every row returned from the database.
//
// To add a new table, define it here and run:
//   npx drizzle-kit generate   ← creates a new SQL migration file
//   npx drizzle-kit migrate    ← applies it to the database

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// The "users" table mirrors Clerk's user records in our own database.
// We keep a local copy so we can join it with other app data (e.g. orders,
// projects) without hitting Clerk's API on every request.
//
// Clerk is the authority for auth; our DB is the authority for app data.
// The two are kept in sync via Clerk webhooks (see webhooks.controller.ts).
export const users = pgTable('users', {
  // Internal UUID primary key — used for foreign-key relationships within our DB.
  id: uuid('id').primaryKey().defaultRandom(),

  // clerkId links this row back to the Clerk user.
  // Every authenticated request from Clerk carries this ID in the JWT.
  clerkId: text('clerk_id').unique().notNull(),

  // User's primary email address, copied from Clerk.
  email: text('email').unique().notNull(),

  // Optional display name fields copied from Clerk's profile.
  firstName: text('first_name'),
  lastName: text('last_name'),

  // Profile picture URL from Clerk (could be a social avatar or uploaded image).
  imageUrl: text('image_url'),

  // Audit timestamps — defaultNow() is set by the database on insert/update.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
