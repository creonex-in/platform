import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UploadsController } from './uploads.controller'
import { UploadsService } from './uploads.service'
import { RolesGuard } from '../auth/roles.guard'
import { BookingsModule } from '../bookings/bookings.module'
import { OfferingsModule } from '../offerings/offerings.module'

@Module({
  imports: [BookingsModule, OfferingsModule],
  controllers: [UploadsController],
  providers: [UploadsService, RolesGuard, Reflector],
  exports: [UploadsService],
})
export class UploadsModule {}
