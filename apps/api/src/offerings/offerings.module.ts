import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { OfferingsController } from './offerings.controller'
import { OfferingsService } from './offerings.service'
import { UsersModule } from '../users/users.module'
import { RolesGuard } from '../auth/roles.guard'

@Module({
  imports: [UsersModule],
  controllers: [OfferingsController],
  providers: [OfferingsService, RolesGuard, Reflector],
  exports: [OfferingsService],
})
export class OfferingsModule {}
