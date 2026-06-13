import {
  Body, Controller, Get, HttpCode, Param,
  Post, Query, RawBodyRequest, Req, UnauthorizedException, UseGuards,
} from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AppUserSession } from '../auth/types'
import { BookingsService } from './bookings.service'
import { PaymentService } from '../payment/payment.service'
import { CancelBookingDto, ConfirmBookingDto, CreateBookingDto } from './bookings.dto'

// ── Learner booking actions ───────────────────────────────────────────────────

@ApiTags('Bookings')
@ApiCookieAuth()
@Controller('v1/bookings')
@UseGuards(AuthGuard, RolesGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post()
  @Roles('learner')
  @ApiOperation({ summary: 'Create booking + Razorpay order' })
  createBooking(@Session() session: AppUserSession, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(session.user.id, dto)
  }

  @Post(':id/confirm')
  @Roles('learner')
  @ApiOperation({ summary: 'Verify Razorpay signature + confirm booking + create Meet link' })
  confirmBooking(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Body() dto: ConfirmBookingDto,
  ) {
    return this.bookingsService.confirmBooking(session.user.id, id, dto)
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @Roles('learner')
  @ApiOperation({ summary: 'Learner cancels booking (refunds if paid)' })
  cancelByLearner(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingsService.cancelBooking(session.user.id, id, dto, 'learner')
  }

  @Get('me')
  @Roles('learner')
  @ApiOperation({ summary: 'List my bookings as a learner' })
  getMyBookings(@Session() session: AppUserSession) {
    return this.bookingsService.getMyBookings(session.user.id)
  }
}

// ── Creator booking view + cancel ─────────────────────────────────────────────

@ApiTags('Bookings')
@ApiCookieAuth()
@Controller('v1/creator/bookings')
@UseGuards(AuthGuard, RolesGuard)
@Roles('creator')
export class CreatorBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('offerings/:offeringId')
  @ApiOperation({ summary: 'List all bookings for one of my offerings' })
  getOfferingBookings(
    @Session() session: AppUserSession,
    @Param('offeringId') offeringId: string,
  ) {
    return this.bookingsService.getCreatorBookings(session.user.id, offeringId)
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Creator cancels a booking (refunds learner)' })
  cancelByCreator(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingsService.cancelBooking(session.user.id, id, dto, 'creator')
  }
}

// ── Razorpay webhook ──────────────────────────────────────────────────────────

@ApiTags('Payments')
@Controller('v1/payments')
export class PaymentWebhookController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Razorpay webhook — backup path for missed confirms' })
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['x-razorpay-signature'] as string | undefined
    if (!signature) throw new UnauthorizedException('Missing webhook signature')

    const rawBody = req.rawBody ?? req.body
    if (!this.paymentService.verifyWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedException('Webhook signature invalid')
    }

    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    if (event?.event === 'payment.captured') {
      const payment = event?.payload?.payment?.entity
      if (payment?.order_id && payment?.id) {
        await this.bookingsService.confirmFromWebhook(payment.order_id, payment.id)
      }
    }

    return { received: true }
  }
}
