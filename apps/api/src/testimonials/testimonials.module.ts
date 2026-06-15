import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UsersModule } from '../users/users.module'
import { BookingsModule } from '../bookings/bookings.module'
import { RolesGuard } from '../auth/roles.guard'
import { CreatorTestimonialsController, PublicTestimonialsController } from './testimonials.controller'
import { TestimonialsService } from './testimonials.service'

@Module({
  imports: [UsersModule, BookingsModule],
  controllers: [CreatorTestimonialsController, PublicTestimonialsController],
  providers: [TestimonialsService, RolesGuard, Reflector],
})
export class TestimonialsModule {}
