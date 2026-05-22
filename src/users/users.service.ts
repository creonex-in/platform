// ─── Users Service ────────────────────────────────────────────────────────────
// The business logic layer for user operations.
// Controllers and webhook handlers call this service; the service calls
// UsersRepository to talk to the database.
//
// Keeping this layer separate means:
//  - Controllers stay thin (no DB code leaking in).
//  - Business rules (validation, transformations) have one home.
//  - Other modules can inject UsersService without touching raw DB queries.

import { Injectable } from '@nestjs/common';
import { UpsertUserData, User, UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  // Look up a user by their Clerk ID (the "sub" claim in the Clerk JWT).
  // Returns null if the user hasn't been synced to our DB yet.
  async getByClerkId(clerkId: string): Promise<User | null> {
    return this.usersRepository.findByClerkId(clerkId);
  }

  // Look up a user by their internal UUID primary key.
  // Used when other parts of the app store our internal ID (not Clerk's).
  async getById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  // Create a new user or update an existing one based on Clerk data.
  // Called by WebhooksController on "user.created" and "user.updated" events,
  // keeping our local DB in sync with Clerk's user records.
  async upsertFromClerk(data: UpsertUserData): Promise<User> {
    return this.usersRepository.upsertFromClerk(data);
  }

  // Remove a user record from our DB when Clerk fires a "user.deleted" event.
  // After this, any request from that Clerk user ID will get a 404 from /users/me.
  async deleteByClerkId(clerkId: string): Promise<void> {
    return this.usersRepository.deleteByClerkId(clerkId);
  }
}
