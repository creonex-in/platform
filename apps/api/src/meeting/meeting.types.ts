export interface CreateMeetingParams {
  creatorProfileId: string
  title: string
  startTime: Date
  endTime: Date
  attendeeEmail?: string
  description?: string
}

export interface MeetingResult {
  provider: string        // 'google_meet'
  meetingUrl: string
  calendarEventId: string
}

export interface MeetingProvider {
  readonly providerName: string
  createMeeting(params: CreateMeetingParams): Promise<MeetingResult>
  deleteMeeting(creatorProfileId: string, calendarEventId: string): Promise<void>
}
