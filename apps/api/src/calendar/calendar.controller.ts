import {
  Controller, Delete, Get, HttpCode, Query, Redirect, UseGuards,
} from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AppUserSession } from '../auth/types'
import { CalendarAuthService } from './calendar-auth.service'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import { NotFoundException } from '@nestjs/common'

@ApiTags('Calendar')
@ApiCookieAuth()
@Controller('v1/calendar')
@UseGuards(AuthGuard, RolesGuard)
@Roles('creator')
export class CalendarController {
  constructor(
    private readonly calendarAuth: CalendarAuthService,
    private readonly creatorProfileRepo: CreatorProfileRepository,
  ) {}

  @Get('google/connect')
  @Redirect()
  @ApiOperation({ summary: 'Initiate Google Calendar OAuth2 flow' })
  async initiateGoogleConnect(@Session() session: AppUserSession) {
    const profile = await this.creatorProfileRepo.findByUserId(session.user.id)
    if (!profile) throw new NotFoundException('Creator profile not found')
    const url = this.calendarAuth.getAuthUrl(profile.id)
    return { url, statusCode: 302 }
  }

  @Get('google/callback')
  @Redirect()
  @ApiOperation({ summary: 'Google OAuth2 callback — exchanges code, stores tokens' })
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
  ) {
    if (error || !code) {
      return { url: 'http://localhost:3001/creator/settings?calendar=error', statusCode: 302 }
    }
    await this.calendarAuth.handleCallback(code, state)
    return { url: 'http://localhost:3001/creator/settings?calendar=connected', statusCode: 302 }
  }

  @Get('status')
  @ApiOperation({ summary: 'Get Google Calendar connection status' })
  async getStatus(@Session() session: AppUserSession) {
    const profile = await this.creatorProfileRepo.findByUserId(session.user.id)
    if (!profile) throw new NotFoundException('Creator profile not found')
    return this.calendarAuth.getConnectionStatus(profile.id)
  }

  @Delete('disconnect')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revoke and remove Google Calendar connection' })
  async disconnect(@Session() session: AppUserSession) {
    const profile = await this.creatorProfileRepo.findByUserId(session.user.id)
    if (!profile) throw new NotFoundException('Creator profile not found')
    await this.calendarAuth.disconnect(profile.id)
    return { success: true }
  }
}
