// ─── Users Controller ─────────────────────────────────────────────────────────
// Handles HTTP requests for the /users route group.
// Controllers are thin — they validate inputs, call the service, and return
// responses. Business logic lives in UsersService, not here.
//
// Routes:
//   GET /users/me  → returns the currently authenticated user's profile

import {
  Controller,
  Get,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { GetClerkUserId } from '../auth/get-auth.decorator';
import { User } from './users.repository';
import { UsersService } from './users.service';

// @Controller('users') prefixes every route in this class with "/users"
@Controller('users')
export class UsersController {
  // NestJS injects UsersService automatically.
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me — returns the profile of the currently logged-in user.
  // @UseGuards(ClerkAuthGuard) enforces authentication: a valid Clerk JWT must
  // be present in the cookie or Authorization header, otherwise 401 is returned.
  // @GetClerkUserId() extracts the Clerk user ID from the verified token
  // (set on req.auth by ClerkAuthGuard) and passes it as the clerkUserId param.
  @Get('me')
  @UseGuards(ClerkAuthGuard)
  async getMe(@GetClerkUserId() clerkUserId: string): Promise<User> {
    const user = await this.usersService.getByClerkId(clerkUserId);

    // If somehow a valid token exists but no matching row is in our DB
    // (e.g. the webhook hasn't fired yet), surface a clear 404.
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
