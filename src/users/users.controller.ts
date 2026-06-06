import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ClerkAuthGuard } from '../auth/clerk.guard'
import { Roles } from '../auth/roles.decorator'
import { GetAuth } from '../auth/get-auth.decorator'
import { UsersService } from './users.service'

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user identity + onboarding state' })
  @Get('me')
  getMe(@GetAuth() auth: Express.Request['auth']): {
    userId: string
    clerkUserId: string
    roles: ('learner' | 'creator')[]
    onboardingComplete: boolean
    onboardingStep: number
  } {
    return {
      userId: auth!.userId,
      clerkUserId: auth!.clerkUserId,
      roles: auth!.roles,
      onboardingComplete: auth!.onboardingComplete,
      onboardingStep: auth!.onboardingStep,
    }
  }

  @ApiOperation({ summary: 'Get creator profile (creator role required)' })
  @Get('me/creator-profile')
  @Roles('creator')
  async getMyCreatorProfile(@GetAuth() auth: Express.Request['auth']) {
    return this.usersService.getCreatorProfile(auth!.userId)
  }

  @ApiOperation({ summary: 'Get learner profile (learner role required)' })
  @Get('me/learner-profile')
  @Roles('learner')
  async getMyLearnerProfile(@GetAuth() auth: Express.Request['auth']) {
    return this.usersService.getLearnerProfile(auth!.userId)
  }
}
