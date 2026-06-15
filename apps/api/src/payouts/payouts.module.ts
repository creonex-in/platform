import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PayoutsController } from './payouts.controller'
import { PayoutsService } from './payouts.service'
import { PayoutsRepository } from './payouts.repository'
import { UsersModule } from '../users/users.module'
import { PaymentModule } from '../payment/payment.module'
import { RolesGuard } from '../auth/roles.guard'

@Module({
  imports: [UsersModule, PaymentModule],
  controllers: [PayoutsController],
  providers: [PayoutsService, PayoutsRepository, RolesGuard, Reflector],
  exports: [PayoutsService, PayoutsRepository],
})
export class PayoutsModule {}
