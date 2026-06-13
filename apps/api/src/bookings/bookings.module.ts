import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { BookingsController, CreatorBookingsController, PaymentWebhookController } from './bookings.controller'
import { BookingsService } from './bookings.service'
import { BookingsRepository } from './bookings.repository'
import { UsersModule } from '../users/users.module'
import { PaymentModule } from '../payment/payment.module'
import { MeetingModule } from '../meeting/meeting.module'
import { RolesGuard } from '../auth/roles.guard'

@Module({
  imports: [UsersModule, PaymentModule, MeetingModule],
  controllers: [BookingsController, CreatorBookingsController, PaymentWebhookController],
  providers: [BookingsService, BookingsRepository, RolesGuard, Reflector],
  exports: [BookingsService],
})
export class BookingsModule {}
