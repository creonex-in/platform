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
import { PayoutsService } from '../payouts/payouts.service'
import { WebhookEventsRepository } from '../payment/webhook-events.repository'
import { CancelBookingDto, ConfirmBookingDto, CreateBookingDto, CreateGuestBookingDto } from './bookings.dto'

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

  @Get()
  @ApiOperation({ summary: 'List all bookings across all my offerings' })
  getAll(@Session() session: AppUserSession) {
    return this.bookingsService.getCreatorAllBookings(session.user.id)
  }

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
    private readonly payoutsService: PayoutsService,
    private readonly webhookEventsRepo: WebhookEventsRepository,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Razorpay webhook — payment confirms + linked-account KYC events' })
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['x-razorpay-signature'] as string | undefined
    if (!signature) throw new UnauthorizedException('Missing webhook signature')

    const rawBody = req.rawBody ?? req.body
    if (!this.paymentService.verifyWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedException('Webhook signature invalid')
    }

    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    const name: string | undefined = event?.event

    // Razorpay guarantees at-least-once delivery — deduplicate by event ID
    const eventId: string | undefined = event?.id
    if (eventId) {
      const seen = await this.webhookEventsRepo.findEvent(eventId)
      if (seen) return { received: true }
    }

    // Payment captured → confirm the booking (backup to client-side confirm).
    if (name === 'payment.captured') {
      const payment = event?.payload?.payment?.entity
      if (payment?.order_id && payment?.id) {
        await this.bookingsService.confirmFromWebhook(payment.order_id, payment.id)
      }
    }

    // Linked-account KYC lifecycle → enable/disable creator payouts.
    if (name?.startsWith('account.')) {
      const accountId: string | undefined = event?.payload?.account?.entity?.id
      if (accountId) {
        if (name === 'account.activated') {
          await this.payoutsService.activateAccount(accountId)
        } else if (name === 'account.suspended' || name === 'account.rejected') {
          await this.payoutsService.deactivateAccount(accountId, 'failed')
        } else if (name === 'account.needs_clarification' || name === 'account.under_review') {
          await this.payoutsService.deactivateAccount(accountId, 'pending')
        }
      }
    }

    // Record event as processed (idempotency guard for future retries)
    if (eventId && name) {
      await this.webhookEventsRepo.insertEvent({ eventId, eventType: name })
    }

    return { received: true }
  }
}

// ── Guest booking (no auth) ───────────────────────────────────────────────────

@ApiTags('Bookings')
@Controller('v1/bookings/guest')
export class GuestBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create booking as guest (no account required)' })
  createGuest(@Body() dto: CreateGuestBookingDto) {
    return this.bookingsService.createGuestBooking(dto)
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm guest booking after Razorpay payment' })
  confirmGuest(@Param('id') id: string, @Body() dto: ConfirmBookingDto) {
    return this.bookingsService.confirmGuestBooking(id, dto)
  }
}
