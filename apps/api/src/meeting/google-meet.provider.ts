import { Injectable } from '@nestjs/common'
import { CalendarAuthService } from '../calendar/calendar-auth.service'
import type { MeetingProvider, CreateMeetingParams, MeetingResult } from './meeting.types'

@Injectable()
export class GoogleMeetProvider implements MeetingProvider {
  readonly providerName = 'google_meet'

  constructor(private readonly calendarAuth: CalendarAuthService) {}

  async createMeeting(params: CreateMeetingParams): Promise<MeetingResult> {
    const { meetUrl, calendarEventId } = await this.calendarAuth.createMeetingEvent({
      creatorProfileId: params.creatorProfileId,
      title: params.title,
      startTime: params.startTime,
      endTime: params.endTime,
      attendeeEmail: params.attendeeEmail,
      description: params.description,
    })

    return {
      provider: this.providerName,
      meetingUrl: meetUrl,
      calendarEventId,
    }
  }

  async deleteMeeting(creatorProfileId: string, calendarEventId: string): Promise<void> {
    await this.calendarAuth.deleteCalendarEvent(creatorProfileId, calendarEventId)
  }
}
