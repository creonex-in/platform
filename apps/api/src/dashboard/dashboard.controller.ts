import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AppUserSession } from '../auth/types'
import { DashboardService } from './dashboard.service'

@ApiTags('Dashboard')
@ApiCookieAuth()
@Controller('v1/creator/dashboard')
@UseGuards(AuthGuard, RolesGuard)
@Roles('creator')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Creator dashboard home summary — sessions, earnings, stats, feed' })
  getSummary(
    @Session() session: AppUserSession,
    @Query('tz') tz?: string,
  ) {
    return this.dashboardService.getSummary(session.user.id, tz)
  }
}
