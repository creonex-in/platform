import { Injectable } from '@nestjs/common';
import { UpsertUserData, User, UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getByClerkId(clerkId: string): Promise<User | null> {
    return this.usersRepository.findByClerkId(clerkId);
  }

  async getById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async upsertFromClerk(data: UpsertUserData): Promise<User> {
    return this.usersRepository.upsertFromClerk(data);
  }

  async deleteByClerkId(clerkId: string): Promise<void> {
    return this.usersRepository.deleteByClerkId(clerkId);
  }
}
