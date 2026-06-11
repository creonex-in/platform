import { Controller, Get, Post, HttpCode, UseGuards } from '@nestjs/common'
import { AuthGuard, Session, type UserSession } from '@mguay/nestjs-better-auth'
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'

@ApiTags('Users')
@ApiCookieAuth()
@Controller('v1/users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current session user' })
  getMe(@Session() session: UserSession) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as typeof session.user & { role?: string }).role,
      image: session.user.image,
    }
  }

  @Post('me/add-creator-role')
  @Roles('learner')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add creator role to current user and create creator profile' })
  addCreatorRole(@Session() session: UserSession) {
    return this.usersService.addCreatorRole(session.user.id, (session.user as typeof session.user & { role: string }).role)
  }

  @Get('me/creator-profile')
  @Roles('creator')
  @ApiOperation({ summary: 'Get creator profile' })
  async getMyCreatorProfile(@Session() session: UserSession) {
    return this.usersService.getCreatorProfile(session.user.id)
  }

  @Get('me/learner-profile')
  @Roles('learner')
  @ApiOperation({ summary: 'Get learner profile' })
  async getMyLearnerProfile(@Session() session: UserSession) {
    return this.usersService.getLearnerProfile(session.user.id)
  }
}
