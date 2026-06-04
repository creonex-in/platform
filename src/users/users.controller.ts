import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common'
import { ClerkAuthGuard } from '../auth/clerk.guard'
import { Roles } from '../auth/roles.decorator'
import { GetAuth } from '../auth/get-auth.decorator'
import { UsersService } from './users.service'

@Controller('api/v1/users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/v1/users/me
   * Called by Next.js on every protected page load
   * Returns identity + routing data from JWT (already on req.auth)
   * No extra DB query needed — guard already fetched the user
   */
  @Get('me')
  async getMe(@GetAuth() auth: Express.Request['auth']) {
    return {
      userId: auth!.userId,
      clerkUserId: auth!.clerkUserId,
      roles: auth!.roles,
      onboardingComplete: auth!.onboardingComplete,
      onboardingStep: auth!.onboardingStep,
    }
  }


  /**
   * GET /api/v1/users/me/creator-profile
   * Returns the creator profile for the logged in creator
   * Used by creator dashboard and settings
   */
  @Get('me/creator-profile')
  @Roles('creator')
  async getMyCreatorProfile(@GetAuth() auth: Express.Request['auth']) {
    const profile = await this.usersService.getCreatorProfile(auth!.userId)
    return profile
  }

  /**
   * GET /api/v1/users/me/learner-profile
   * Returns the learner profile for the logged in user
   * Used by learner dashboard and recommendations
   */
  @Get('me/learner-profile')
  @Roles('learner')
  async getMyLearnerProfile(@GetAuth() auth: Express.Request['auth']) {
    const profile = await this.usersService.getLearnerProfile(auth!.userId)
    return profile
  }
}