import { Injectable, BadRequestException } from '@nestjs/common'
import { GoogleMeetProvider } from './google-meet.provider'
import type { CreateMeetingParams, MeetingResult, MeetingProvider } from './meeting.types'

@Injectable()
export class MeetingService {
  private readonly providers: Map<string, MeetingProvider>

  constructor(private readonly googleMeet: GoogleMeetProvider) {
    this.providers = new Map([
      [googleMeet.providerName, googleMeet],
    ])
  }

  /**
   * Creates a meeting via the given provider.
   * Returns null if creator has no calendar connected — booking still proceeds,
   * but meeting_url will be null (creator must add manually).
   */
  async createMeeting(
    provider: string,
    params: CreateMeetingParams,
  ): Promise<MeetingResult | null> {
    const impl = this.providers.get(provider)
    if (!impl) throw new BadRequestException(`Unknown meeting provider: ${provider}`)

    try {
      return await impl.createMeeting(params)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // Calendar not connected → graceful null (don't block booking)
      if (msg.includes('not connected') || msg.includes('not found')) return null
      throw err
    }
  }

  async deleteMeeting(
    provider: string,
    creatorProfileId: string,
    calendarEventId: string,
  ): Promise<void> {
    const impl = this.providers.get(provider)
    if (!impl) return // unknown provider — nothing to delete
    await impl.deleteMeeting(creatorProfileId, calendarEventId)
  }

  getDefaultProvider(): string {
    return 'google_meet'
  }
}
