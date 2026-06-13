import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { google } from 'googleapis'

type OAuth2Client = InstanceType<typeof google.auth.OAuth2>
import { CalendarConnectionsRepository } from './calendar-connections.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
]

export interface FreeBusyInterval {
  start: Date
  end: Date
}

@Injectable()
export class CalendarAuthService {
  private readonly redirectUri: string

  constructor(
    private readonly config: ConfigService,
    private readonly calendarRepo: CalendarConnectionsRepository,
    private readonly creatorProfileRepo: CreatorProfileRepository,
  ) {
    const baseUrl = this.config.get<string>('API_BASE_URL', 'http://localhost:3000')
    this.redirectUri = `${baseUrl}/api/v1/calendar/google/callback`
  }

  private buildClient(): OAuth2Client {
    return new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      this.redirectUri,
    )
  }

  // ── OAuth flow ────────────────────────────────────────────────────────────────

  getAuthUrl(creatorProfileId: string): string {
    const client = this.buildClient()
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',       // always return refresh_token
      scope: SCOPES,
      state: creatorProfileId, // carried through callback for ownership
    })
  }

  async handleCallback(code: string, state: string): Promise<void> {
    const creatorProfileId = state
    const profile = await this.creatorProfileRepo.findById(creatorProfileId)
    if (!profile) throw new NotFoundException('Creator profile not found')

    const client = this.buildClient()
    const { tokens } = await client.getToken(code)

    if (!tokens.access_token) throw new UnauthorizedException('No access token returned')

    // Fetch connected Google account email
    client.setCredentials(tokens)
    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const { data: userInfo } = await oauth2.userinfo.get()

    await this.calendarRepo.upsert({
      creatorProfileId,
      provider: 'google',
      accountEmail: userInfo.email ?? undefined,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? undefined,
      tokenExpiresAt: new Date(tokens.expiry_date ?? Date.now() + 3600_000),
    })
  }

  async disconnect(creatorProfileId: string): Promise<void> {
    const conn = await this.calendarRepo.findByCreatorAndProvider(creatorProfileId, 'google')
    if (!conn) return

    // Revoke token with Google
    if (conn.accessToken) {
      const client = this.buildClient()
      client.setCredentials({ access_token: conn.accessToken })
      await client.revokeCredentials().catch(() => {/* ignore — delete locally regardless */})
    }

    await this.calendarRepo.delete(creatorProfileId, 'google')
  }

  async getConnectionStatus(creatorProfileId: string) {
    const conn = await this.calendarRepo.findByCreatorAndProvider(creatorProfileId, 'google')
    if (!conn) return { connected: false }
    return { connected: true, accountEmail: conn.accountEmail }
  }

  // ── Token management ──────────────────────────────────────────────────────────

  async getValidAccessToken(creatorProfileId: string): Promise<string> {
    const conn = await this.calendarRepo.findByCreatorAndProvider(creatorProfileId, 'google')
    if (!conn?.refreshToken) throw new NotFoundException('Google Calendar not connected')

    const expiryBuffer = 60_000 // refresh 60s before actual expiry
    const isExpired = !conn.tokenExpiresAt || conn.tokenExpiresAt.getTime() - Date.now() < expiryBuffer

    if (!isExpired && conn.accessToken) return conn.accessToken

    // Refresh
    const client = this.buildClient()
    client.setCredentials({ refresh_token: conn.refreshToken })
    const { credentials } = await client.refreshAccessToken()

    if (!credentials.access_token) throw new UnauthorizedException('Token refresh failed')

    await this.calendarRepo.updateAccessToken(
      creatorProfileId,
      'google',
      credentials.access_token,
      new Date(credentials.expiry_date ?? Date.now() + 3600_000),
    )

    return credentials.access_token
  }

  // ── Calendar freebusy ─────────────────────────────────────────────────────────

  async getFreeBusy(
    creatorProfileId: string,
    timeMin: Date,
    timeMax: Date,
  ): Promise<FreeBusyInterval[]> {
    const conn = await this.calendarRepo.findByCreatorAndProvider(creatorProfileId, 'google')
    if (!conn) return [] // not connected — no busy blocks

    const accessToken = await this.getValidAccessToken(creatorProfileId)
    const client = this.buildClient()
    client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth: client })
    const { data } = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: conn.calendarId }],
      },
    })

    const busy = data.calendars?.[conn.calendarId]?.busy ?? []
    return busy
      .filter((b) => b.start && b.end)
      .map((b) => ({ start: new Date(b.start!), end: new Date(b.end!) }))
  }

  // ── Meeting creation (used by MeetingModule) ──────────────────────────────────

  async createMeetingEvent(params: {
    creatorProfileId: string
    title: string
    startTime: Date
    endTime: Date
    attendeeEmail?: string
    description?: string
  }): Promise<{ meetUrl: string; calendarEventId: string }> {
    const accessToken = await this.getValidAccessToken(params.creatorProfileId)
    const conn = await this.calendarRepo.findByCreatorAndProvider(params.creatorProfileId, 'google')

    const client = this.buildClient()
    client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth: client })
    const { data: event } = await calendar.events.insert({
      calendarId: conn?.calendarId ?? 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: params.title,
        description: params.description,
        start: { dateTime: params.startTime.toISOString() },
        end: { dateTime: params.endTime.toISOString() },
        ...(params.attendeeEmail
          ? { attendees: [{ email: params.attendeeEmail }] }
          : {}),
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    })

    const meetUrl = event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri
    if (!meetUrl) throw new Error('Google Meet URL not returned from Calendar API')

    return { meetUrl, calendarEventId: event.id! }
  }

  async deleteCalendarEvent(creatorProfileId: string, calendarEventId: string): Promise<void> {
    const conn = await this.calendarRepo.findByCreatorAndProvider(creatorProfileId, 'google')
    if (!conn) return

    const accessToken = await this.getValidAccessToken(creatorProfileId)
    const client = this.buildClient()
    client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth: client })
    await calendar.events.delete({
      calendarId: conn.calendarId,
      eventId: calendarEventId,
      sendUpdates: 'all', // notify attendees of cancellation
    }).catch(() => {/* already deleted or not found — ignore */})
  }
}
