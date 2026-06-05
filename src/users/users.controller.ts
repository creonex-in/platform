import {
  Controller,
  Get,
  Post,
  HttpCode,
  UseGuards,
  Inject,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { createClerkClient } from '@clerk/backend'
import { ClerkAuthGuard } from '../auth/clerk.guard'
import { Roles } from '../auth/roles.decorator'
import { GetAuth } from '../auth/get-auth.decorator'
import { UsersService } from './users.service'
import { ClerkPublicMetadata } from './webhook-events.types'

type ClerkClient = ReturnType<typeof createClerkClient>

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject('CLERK_CLIENT') private readonly clerkClient: ClerkClient,
  ) {}

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

  @ApiOperation({ summary: 'Add creator role to existing learner account' })
  @Post('add-creator-role')
  @HttpCode(200)
  async addCreatorRole(
    @GetAuth() auth: Express.Request['auth'],
  ): Promise<{
    success: true
    roles: ('learner' | 'creator')[]
    alreadyCreator?: boolean
    redirectTo?: string
  }> {
    const currentRoles = auth!.roles

    if (currentRoles.includes('creator')) {
      return { success: true, roles: currentRoles, alreadyCreator: true }
    }

    const newRoles: ('learner' | 'creator')[] = [...currentRoles, 'creator']

    // Preserve existing metadata, only override relevant fields
    const clerkUser = await this.clerkClient.users.getUser(auth!.clerkUserId)
    const existingMeta = (clerkUser.publicMetadata ?? {}) as Partial<ClerkPublicMetadata>

    await this.clerkClient.users.updateUserMetadata(auth!.clerkUserId, {
      publicMetadata: {
        ...existingMeta,
        roles: newRoles,
        onboarding_complete: false,
        onboarding_step: 1,
      },
    })

    await this.usersService.updateRoles(auth!.userId, newRoles)
    await this.usersService.updateOnboardingStep(auth!.userId, 1)
    await this.usersService.createCreatorProfile(auth!.userId)

    return {
      success: true,
      roles: newRoles,
      redirectTo: '/onboarding/creator/step-1',
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
