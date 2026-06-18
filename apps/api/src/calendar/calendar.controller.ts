import {
  Controller, Delete, Get, HttpCode, Query, Redirect, UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard, Public, Session } from '@mguay/nestjs-better-auth'
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
    private readonly config: ConfigService,
  ) {}

  /** Web app origin to bounce the user back to after the OAuth callback. */
  private get webUrl(): string {
    return this.config.get<string>('WEB_URL', 'http://localhost:3001')
  }

  @Get('google/connect')
  @Redirect()
  @ApiOperation({ summary: 'Initiate Google Calendar OAuth2 flow' })
  async initiateGoogleConnect(@Session() session: AppUserSession) {
    const profile = await this.creatorProfileRepo.findByUserId(session.user.id)
    if (!profile) throw new NotFoundException('Creator profile not found')
    const url = this.calendarAuth.getAuthUrl(profile.id)
    return { url, statusCode: 302 }
  }

  // Public: Google redirects the browser straight here with no session cookie
  // (and on a split-domain deploy the cookie lives on the web origin anyway).
  // Ownership is verified via the `state` param (= creator profile id), so the
  // AuthGuard/RolesGuard would only ever 401 a legitimate callback. @Public()
  // skips AuthGuard; @Roles() (empty) overrides the controller role so
  // RolesGuard passes.
  @Public()
  @Roles()
  @Get('google/callback')
  @Redirect()
  @ApiOperation({ summary: 'Google OAuth2 callback — exchanges code, stores tokens' })
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
  ) {
    if (error || !code) {
      return { url: `${this.webUrl}/calendar?calendar=error`, statusCode: 302 }
    }
    try {
      await this.calendarAuth.handleCallback(code, state)
    } catch {
      return { url: `${this.webUrl}/calendar?calendar=error`, statusCode: 302 }
    }
    return { url: `${this.webUrl}/calendar?calendar=connected`, statusCode: 302 }
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
