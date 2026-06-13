import { Module } from '@nestjs/common'
import { MeetingService } from './meeting.service'
import { GoogleMeetProvider } from './google-meet.provider'
import { CalendarModule } from '../calendar/calendar.module'

@Module({
  imports: [CalendarModule],
  providers: [MeetingService, GoogleMeetProvider],
  exports: [MeetingService],
})
export class MeetingModule {}
