import { Controller, Get, Post, HttpCode, UseGuards } from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AppUserSession } from '../auth/types'

@ApiTags('Users')
@ApiCookieAuth()
@Controller('v1/users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current session user' })
  getMe(@Session() session: AppUserSession) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      image: session.user.image,
    }
  }

  @Post('me/add-creator-role')
  @Roles('learner')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add creator role to current user' })
  addCreatorRole(@Session() session: AppUserSession) {
    return this.usersService.addCreatorRole(session.user.id, session.user.role)
  }

  @Get('me/creator-profile')
  @Roles('creator')
  @ApiOperation({ summary: 'Get creator profile' })
  getMyCreatorProfile(@Session() session: AppUserSession) {
    return this.usersService.getCreatorProfile(session.user.id)
  }

  @Get('me/learner-profile')
  @Roles('learner')
  @ApiOperation({ summary: 'Get learner profile' })
  getMyLearnerProfile(@Session() session: AppUserSession) {
    return this.usersService.getLearnerProfile(session.user.id)
  }
}
