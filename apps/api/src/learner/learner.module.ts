import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { LearnerController } from './learner.controller'
import { LearnerService } from './learner.service'
import { LearnerRepository } from './learner.repository'
import { UsersModule } from '../users/users.module'
import { BookingsModule } from '../bookings/bookings.module'
import { RolesGuard } from '../auth/roles.guard'

@Module({
  imports: [UsersModule, BookingsModule],
  controllers: [LearnerController],
  providers: [LearnerService, LearnerRepository, RolesGuard, Reflector],
})
export class LearnerModule {}
