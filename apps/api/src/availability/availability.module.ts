import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SchedulesController, AvailabilityController } from './schedules.controller'
import { SchedulesService } from './schedules.service'
import { SchedulesRepository } from './schedules.repository'
import { SlotGenerationService } from './slot-generation.service'
import { UsersModule } from '../users/users.module'
import { CalendarModule } from '../calendar/calendar.module'
import { RolesGuard } from '../auth/roles.guard'

@Module({
  imports: [UsersModule, CalendarModule],
  controllers: [SchedulesController, AvailabilityController],
  providers: [SchedulesService, SchedulesRepository, SlotGenerationService, RolesGuard, Reflector],
  exports: [SlotGenerationService],
})
export class AvailabilityModule {}
