import { Module } from '@nestjs/common'
import { PaymentService } from './payment.service'

// No controller — all payment HTTP endpoints live in BookingsModule
// (every payment action involves a booking state transition).
// BookingsModule imports this module and calls PaymentService directly.

@Module({
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
