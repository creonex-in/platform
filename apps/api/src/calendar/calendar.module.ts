import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CalendarController } from './calendar.controller'
import { CalendarAuthService } from './calendar-auth.service'
import { CalendarConnectionsRepository } from './calendar-connections.repository'
import { UsersModule } from '../users/users.module'
import { RolesGuard } from '../auth/roles.guard'

@Module({
  imports: [UsersModule],
  controllers: [CalendarController],
  providers: [CalendarAuthService, CalendarConnectionsRepository, RolesGuard, Reflector],
  exports: [CalendarAuthService],
})
export class CalendarModule {}
