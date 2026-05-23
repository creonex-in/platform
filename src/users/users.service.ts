// Business logic layer for user operations — sits between controllers and the repository.
import { Injectable } from '@nestjs/common';
import { UpsertUserData, User, UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  // Returns a user by their Clerk ID, or null if not found.
  async getByClerkId(clerkId: string): Promise<User | null> {
    return this.usersRepository.findByClerkId(clerkId);
  }

  // Returns a user by their internal UUID, or null if not found.
  async getById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  // Creates or updates a user record using data received from a Clerk webhook.
  async upsertFromClerk(data: UpsertUserData): Promise<User> {
    return this.usersRepository.upsertFromClerk(data);
  }

  // Deletes a user record when Clerk fires a user.deleted webhook event.
  async deleteByClerkId(clerkId: string): Promise<void> {
    return this.usersRepository.deleteByClerkId(clerkId);
  }
}
