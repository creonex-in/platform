import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BookingsRepository } from './bookings.repository'
import { LearnerProfileRepository } from '../users/learner-profile.repository'
import { OfferingsRepository } from '../users/offerings.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import { PayoutsRepository } from '../payouts/payouts.repository'
import { PaymentService } from '../payment/payment.service'
import { MeetingService } from '../meeting/meeting.service'
import { SlotGenerationService } from '../availability/slot-generation.service'
import { NotificationsService } from '../notifications/notifications.service'
import { DEFAULT_PLATFORM_FEE_BPS } from '@creonex/types'
import type { CreateBookingDto, CreateGuestBookingDto, ConfirmBookingDto, CancelBookingDto } from './bookings.dto'

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name)
  /** Platform commission in basis points (1000 = 10%). Configurable; snapshotted per ledger row. */
  private readonly platformFeeBps: number

  constructor(
    private readonly bookingsRepo: BookingsRepository,
    private readonly learnerProfileRepo: LearnerProfileRepository,
    private readonly offeringsRepo: OfferingsRepository,
    private readonly creatorProfileRepo: CreatorProfileRepository,
    private readonly payoutsRepo: PayoutsRepository,
    private readonly paymentService: PaymentService,
    private readonly meetingService: MeetingService,
    private readonly slotService: SlotGenerationService,
    private readonly notificationsService: NotificationsService,
    private readonly config: ConfigService,
  ) {
    this.platformFeeBps = Number(
      this.config.get<string>('PLATFORM_FEE_BPS', String(DEFAULT_PLATFORM_FEE_BPS)),
    )
  }

  /**
   * Split a confirmed payment to the creator via Razorpay Route + write the earnings
   * ledger. Amounts are server-derived (never trust client). Idempotent — one ledger
   * row per booking. If the creator isn't payout-ready (no linked account / KYC not
   * verified) the earning is recorded as `pending`; a transfer is created once they
   * are. Failures here never break booking confirmation.
   */
  private async recordCreatorEarning(
    booking: { id: string; amountPaise: number; razorpayPaymentId: string | null },
    creatorProfileId: string,
  ): Promise<void> {
    try {
      const gross = booking.amountPaise
      const feeBps = this.platformFeeBps
      const platformFeePaise = Math.round((gross * feeBps) / 10000)
      const netPaise = gross - platformFeePaise

      const creator = await this.creatorProfileRepo.findById(creatorProfileId)
      let transferId: string | null = null
      let status: 'pending' | 'settled' = 'pending'

      if (creator?.razorpayAccountId && creator.payoutsEnabled && booking.razorpayPaymentId) {
        try {
          const transfer = await this.paymentService.createTransfer(
            booking.razorpayPaymentId,
            creator.razorpayAccountId,
            netPaise,
            { onHold: false },
          )
          transferId = transfer.id
          status = 'settled'
        } catch (err) {
          this.logger.warn(`Transfer deferred for booking ${booking.id}: ${String(err)}`)
        }
      }

      await this.payoutsRepo.createLedgerEntry({
        creatorProfileId,
        bookingId: booking.id,
        grossPaise: gross,
        platformFeePaise,
        feeBps,
        netPaise,
        razorpayTransferId: transferId,
        status,
      })
    } catch (err) {
      this.logger.error(`Failed to record creator earning for booking ${booking.id}: ${String(err)}`)
    }
  }

  /** Reverse the creator's transfer + mark the ledger row reversed (on refund/cancel). */
  private async reverseCreatorEarning(bookingId: string): Promise<void> {
    try {
      const entry = await this.payoutsRepo.findLedgerByBooking(bookingId)
      if (!entry) return
      if (entry.razorpayTransferId && entry.status === 'settled') {
        await this.paymentService
          .reverseTransfer(entry.razorpayTransferId, entry.netPaise)
          .catch((err) => this.logger.warn(`Reversal failed for booking ${bookingId}: ${String(err)}`))
      }
      await this.payoutsRepo.setLedgerStatusByBooking(bookingId, 'reversed')
    } catch (err) {
      this.logger.error(`Failed to reverse creator earning for booking ${bookingId}: ${String(err)}`)
    }
  }

  /** Types that consume a seat (atomic decrement). */
  private isSeatedType(type: string): boolean {
    return type === 'live_event'
  }

  /**
   * Resolve the booking's start/end per offering type:
   * - one_on_one: learner picks a slot → validate it, derive end from duration
   * - live_event: fixed event → use the offering's `scheduledAt` (ignore client time)
   * - digital: async purchase → no times
   */
  private async resolveBookingTimes(
    offering: { id: string; type: string; durationMinutes: number | null; scheduledAt: Date | null },
    dto: { startTime?: string; endTime?: string; learnerTimezone?: string },
  ): Promise<{ startTime?: Date; endTime?: Date }> {
    if (offering.type === 'one_on_one') {
      if (!dto.startTime) throw new BadRequestException('startTime is required for 1:1 bookings')
      return this.validateSlot(offering, dto.startTime, dto.learnerTimezone)
    }
    if (offering.type === 'digital') {
      return {} // async — no scheduled time, no meeting
    }
    // live_event: a single fixed event time set by the creator
    if (!offering.scheduledAt) {
      throw new BadRequestException('This event has no scheduled time')
    }
    const start = offering.scheduledAt
    if (start.getTime() <= Date.now()) {
      throw new BadRequestException('This event has already started')
    }
    const durationMin = offering.durationMinutes ?? 60
    return { startTime: start, endTime: new Date(start.getTime() + durationMin * 60_000) }
  }

  // ── Slot validation ──────────────────────────────────────────────────────────

  /**
   * Verify the requested 1:1 start is a real, currently-offered schedule slot, and
   * derive the end from the offering's duration — never trust client-supplied end.
   * Existing platform bookings are ignored here so a learner can retry their own
   * pending hold; the DB unique index remains the double-booking guard.
   */
  private async validateSlot(
    offering: { id: string; durationMinutes: number | null },
    startTimeStr: string,
    learnerTz?: string,
  ): Promise<{ startTime: Date; endTime: Date }> {
    const startTime = new Date(startTimeStr)
    if (Number.isNaN(startTime.getTime())) {
      throw new BadRequestException('Invalid startTime')
    }
    const durationMin = offering.durationMinutes ?? 30
    const endTime = new Date(startTime.getTime() + durationMin * 60_000)

    const dayMs = 86_400_000
    const fromDate = new Date(startTime.getTime() - dayMs).toISOString().slice(0, 10)
    const toDate = new Date(startTime.getTime() + dayMs).toISOString().slice(0, 10)

    const slots = await this.slotService.generateSlots(
      { offeringId: offering.id, learnerTz: learnerTz ?? 'UTC', fromDate, toDate },
      { ignoreExistingBookings: true },
    )
    const wanted = startTime.getTime()
    if (!slots.some((s) => new Date(s.start).getTime() === wanted)) {
      throw new ConflictException('That time is no longer available. Please pick another slot.')
    }
    return { startTime, endTime }
  }

  // ── Create booking + Razorpay order ──────────────────────────────────────────

  async createBooking(userId: string, dto: CreateBookingDto) {
    // Ensure learner profile exists (auto-create on first booking)
    let learnerProfile = await this.learnerProfileRepo.findByUserId(userId)
    if (!learnerProfile) {
      learnerProfile = await this.learnerProfileRepo.create(userId)
      if (!learnerProfile) throw new NotFoundException('Could not create learner profile')
    }

    const offering = await this.offeringsRepo.findById(dto.offeringId)
    if (!offering) throw new NotFoundException('Offering not found')
    if (offering.status !== 'live') throw new BadRequestException('Offering is not available for booking')

    // Per-type start/end resolution (1:1 slot, live_event fixed time, digital none)
    const { startTime, endTime } = await this.resolveBookingTimes(offering, dto)

    // Seat check for seated types (live_event)
    if (this.isSeatedType(offering.type) && offering.seatsTotal !== null) {
      if ((offering.seatsRemaining ?? 0) <= 0) {
        throw new ConflictException('No seats remaining')
      }
    }

    // Create Razorpay order first (need orderId before inserting booking)
    const receipt = `bk_${Date.now()}`
    const order = await this.paymentService.createOrder(offering.price, receipt)

    // Insert booking — DB unique index catches concurrent slot race
    let bookingId: string
    try {
      bookingId = await this.bookingsRepo.create({
        offeringId: dto.offeringId,
        learnerProfileId: learnerProfile.id,
        startTime: startTime ?? null,
        endTime: endTime ?? null,
        status: 'pending_payment',
        amountPaise: offering.price,
        learnerTimezone: dto.learnerTimezone ?? null,
        topic: dto.topic ?? null,
        razorpayOrderId: order.id,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('uq_bookings_active_slot')) {
        throw new ConflictException('This slot was just booked by someone else')
      }
      throw err
    }

    // Atomic seat decrement for seated types
    if (this.isSeatedType(offering.type) && offering.seatsTotal !== null) {
      const decremented = await this.bookingsRepo.decrementSeats(dto.offeringId)
      if (!decremented) {
        // Another booking consumed the last seat between our check and insert
        await this.bookingsRepo.cancel(bookingId, { cancelledBy: 'system', cancellationReason: 'No seats remaining' })
        throw new ConflictException('No seats remaining')
      }
    }

    return {
      bookingId,
      razorpayOrderId: order.id,
      amountPaise: order.amount,
      currency: order.currency,
      razorpayKeyId: this.paymentService.getPublicKey(),
    }
  }

  // ── Guest booking (no auth) ───────────────────────────────────────────────────

  async createGuestBooking(dto: CreateGuestBookingDto) {
    const offering = await this.offeringsRepo.findById(dto.offeringId)
    if (!offering) throw new NotFoundException('Offering not found')
    if (offering.status !== 'live') throw new BadRequestException('Offering is not available for booking')

    const { startTime, endTime } = await this.resolveBookingTimes(offering, dto)

    if (this.isSeatedType(offering.type) && offering.seatsTotal !== null) {
      if ((offering.seatsRemaining ?? 0) <= 0) {
        throw new ConflictException('No seats remaining')
      }
    }

    const receipt = `bk_${Date.now()}`
    const order = await this.paymentService.createOrder(offering.price, receipt)

    let bookingId: string
    try {
      bookingId = await this.bookingsRepo.create({
        offeringId: dto.offeringId,
        learnerProfileId: null,
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        guestPhone: dto.guestPhone ?? null,
        startTime: startTime ?? null,
        endTime: endTime ?? null,
        status: 'pending_payment',
        amountPaise: offering.price,
        learnerTimezone: dto.learnerTimezone ?? null,
        topic: dto.topic ?? null,
        razorpayOrderId: order.id,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('uq_bookings_active_slot')) {
        throw new ConflictException('This slot was just booked by someone else')
      }
      throw err
    }

    if (this.isSeatedType(offering.type) && offering.seatsTotal !== null) {
      const decremented = await this.bookingsRepo.decrementSeats(dto.offeringId)
      if (!decremented) {
        await this.bookingsRepo.cancel(bookingId, { cancelledBy: 'system', cancellationReason: 'No seats remaining' })
        throw new ConflictException('No seats remaining')
      }
    }

    return {
      bookingId,
      razorpayOrderId: order.id,
      amountPaise: order.amount,
      currency: order.currency,
      razorpayKeyId: this.paymentService.getPublicKey(),
    }
  }

  async confirmGuestBooking(bookingId: string, dto: ConfirmBookingDto) {
    const booking = await this.bookingsRepo.findById(bookingId)
    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.status !== 'pending_payment') {
      throw new BadRequestException(`Booking is already ${booking.status}`)
    }

    const valid = this.paymentService.verifyPaymentSignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    )
    if (!valid) throw new UnauthorizedException('Payment signature invalid')

    const offering = await this.offeringsRepo.findById(booking.offeringId)
    if (!offering) throw new NotFoundException('Offering not found')

    // Only timed bookings (1:1, live_event) get a meeting; digital has no start time.
    const meeting = booking.startTime && booking.endTime
      ? await this.meetingService.createMeeting(
          this.meetingService.getDefaultProvider(),
          {
            creatorProfileId: offering.creatorProfileId,
            title: offering.title,
            startTime: booking.startTime,
            endTime: booking.endTime,
            description: booking.topic ?? undefined,
          },
        ).catch(() => null)
      : null

    await this.bookingsRepo.confirm(bookingId, {
      razorpayPaymentId: dto.razorpayPaymentId,
      meetingProvider: meeting?.provider,
      meetingUrl: meeting?.meetingUrl,
      calendarEventId: meeting?.calendarEventId,
    })

    void Promise.all([
      this.bookingsRepo.incrementOfferingCounters(booking.offeringId, booking.amountPaise),
      this.bookingsRepo.incrementCreatorSessions(offering.creatorProfileId),
    ])

    // Split to the creator (Route) + write the earnings ledger.
    void this.recordCreatorEarning(
      { id: bookingId, amountPaise: booking.amountPaise, razorpayPaymentId: dto.razorpayPaymentId },
      offering.creatorProfileId,
    )

    const bookingForNotify = { ...booking, meetingUrl: meeting?.meetingUrl ?? null, razorpayPaymentId: dto.razorpayPaymentId }
    if (offering.type === 'digital') {
      void this.notificationsService.notifyDigitalDelivery(bookingForNotify, offering)
    } else {
      void this.notificationsService.notifyBookingConfirmed(bookingForNotify, offering)
    }

    return this.bookingsRepo.findById(bookingId)
  }

  // ── Confirm after successful payment ─────────────────────────────────────────

  async confirmBooking(userId: string, bookingId: string, dto: ConfirmBookingDto) {
    const learnerProfile = await this.learnerProfileRepo.findByUserId(userId)
    if (!learnerProfile) throw new UnauthorizedException()

    const booking = await this.bookingsRepo.findByIdForLearner(bookingId, learnerProfile.id)
    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.status !== 'pending_payment') {
      throw new BadRequestException(`Booking is already ${booking.status}`)
    }

    const valid = this.paymentService.verifyPaymentSignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    )
    if (!valid) throw new UnauthorizedException('Payment signature invalid')

    // Fetch offering to get creatorProfileId for meeting + counters
    const offering = await this.offeringsRepo.findById(booking.offeringId)
    if (!offering) throw new NotFoundException('Offering not found')

    // Create Google Meet — gracefully null if calendar not connected
    // Only timed bookings (1:1, live_event) get a meeting; digital has no start time.
    const meeting = booking.startTime && booking.endTime
      ? await this.meetingService.createMeeting(
          this.meetingService.getDefaultProvider(),
          {
            creatorProfileId: offering.creatorProfileId,
            title: offering.title,
            startTime: booking.startTime,
            endTime: booking.endTime,
            description: booking.topic ?? undefined,
          },
        ).catch(() => null)
      : null

    // Confirm booking
    await this.bookingsRepo.confirm(bookingId, {
      razorpayPaymentId: dto.razorpayPaymentId,
      meetingProvider: meeting?.provider,
      meetingUrl: meeting?.meetingUrl,
      calendarEventId: meeting?.calendarEventId,
    })

    // Fire-and-forget counters (don't block response)
    void Promise.all([
      this.bookingsRepo.incrementOfferingCounters(booking.offeringId, booking.amountPaise),
      this.bookingsRepo.incrementCreatorSessions(offering.creatorProfileId),
    ])

    // Split to the creator (Route) + write the earnings ledger.
    void this.recordCreatorEarning(
      { id: bookingId, amountPaise: booking.amountPaise, razorpayPaymentId: dto.razorpayPaymentId },
      offering.creatorProfileId,
    )

    const bookingForNotify = { ...booking, meetingUrl: meeting?.meetingUrl ?? null, razorpayPaymentId: dto.razorpayPaymentId }
    if (offering.type === 'digital') {
      void this.notificationsService.notifyDigitalDelivery(bookingForNotify, offering)
    } else {
      void this.notificationsService.notifyBookingConfirmed(bookingForNotify, offering)
    }

    return this.bookingsRepo.findById(bookingId)
  }

  // ── Internal confirm (called from webhook) ────────────────────────────────────

  async confirmFromWebhook(razorpayOrderId: string, razorpayPaymentId: string) {
    const booking = await this.bookingsRepo.findByRazorpayOrderId(razorpayOrderId)
    if (!booking || booking.status !== 'pending_payment') return

    const offering = await this.offeringsRepo.findById(booking.offeringId)
    if (!offering) return

    // Only timed bookings (1:1, live_event) get a meeting; digital has no start time.
    const meeting = booking.startTime && booking.endTime
      ? await this.meetingService.createMeeting(
          this.meetingService.getDefaultProvider(),
          {
            creatorProfileId: offering.creatorProfileId,
            title: offering.title,
            startTime: booking.startTime,
            endTime: booking.endTime,
            description: booking.topic ?? undefined,
          },
        ).catch(() => null)
      : null

    await this.bookingsRepo.confirm(booking.id, {
      razorpayPaymentId,
      meetingProvider: meeting?.provider,
      meetingUrl: meeting?.meetingUrl,
      calendarEventId: meeting?.calendarEventId,
    })

    void Promise.all([
      this.bookingsRepo.incrementOfferingCounters(booking.offeringId, booking.amountPaise),
      this.bookingsRepo.incrementCreatorSessions(offering.creatorProfileId),
    ])

    void this.recordCreatorEarning(
      { id: booking.id, amountPaise: booking.amountPaise, razorpayPaymentId },
      offering.creatorProfileId,
    )

    const bookingForNotify = { ...booking, meetingUrl: meeting?.meetingUrl ?? null, razorpayPaymentId }
    if (offering.type === 'digital') {
      void this.notificationsService.notifyDigitalDelivery(bookingForNotify, offering)
    } else {
      void this.notificationsService.notifyBookingConfirmed(bookingForNotify, offering)
    }
  }

  // ── Cancel booking ────────────────────────────────────────────────────────────

  async cancelBooking(userId: string, bookingId: string, dto: CancelBookingDto, role: 'learner' | 'creator') {
    let cancelledBy: string
    let booking

    if (role === 'learner') {
      const learnerProfile = await this.learnerProfileRepo.findByUserId(userId)
      if (!learnerProfile) throw new UnauthorizedException()
      booking = await this.bookingsRepo.findByIdForLearner(bookingId, learnerProfile.id)
      cancelledBy = 'learner'
    } else {
      // Creator cancels — verify they own the offering
      const creatorProfile = await this.creatorProfileRepo.findByUserId(userId)
      if (!creatorProfile) throw new UnauthorizedException()
      booking = await this.bookingsRepo.findById(bookingId)
      if (!booking) throw new NotFoundException('Booking not found')
      const offering = await this.offeringsRepo.findById(booking.offeringId)
      if (!offering || offering.creatorProfileId !== creatorProfile.id) {
        throw new ForbiddenException('Not your booking')
      }
      cancelledBy = 'creator'
    }

    if (!booking) throw new NotFoundException('Booking not found')
    if (!['pending_payment', 'confirmed'].includes(booking.status)) {
      throw new BadRequestException(`Cannot cancel booking with status: ${booking.status}`)
    }

    await this.bookingsRepo.cancel(bookingId, {
      cancelledBy,
      cancellationReason: dto.reason,
    })

    // Reverse offering counters only if this booking had been confirmed (counted).
    if (booking.status === 'confirmed') {
      void this.bookingsRepo.decrementOfferingCounters(booking.offeringId, booking.amountPaise)
      // Claw back the creator's transfer + mark the ledger reversed.
      void this.reverseCreatorEarning(bookingId)
    }

    // Restore seat for seated types (live_event)
    const offering = await this.offeringsRepo.findById(booking.offeringId)
    if (offering && this.isSeatedType(offering.type) && offering.seatsTotal !== null) {
      void this.bookingsRepo.restoreSeats(booking.offeringId)
    }

    // Refund if payment was captured
    if (booking.razorpayPaymentId) {
      void this.paymentService.refund(booking.razorpayPaymentId, booking.amountPaise)
        .catch(() => {/* log in real prod */})
    }

    // Delete calendar event if created
    if (booking.calendarEventId && booking.meetingProvider && offering) {
      void this.meetingService
        .deleteMeeting(booking.meetingProvider, offering.creatorProfileId, booking.calendarEventId)
        .catch(() => {})
    }

    if (offering) {
      void this.notificationsService.notifyBookingCancelled(booking, offering, cancelledBy)
    }

    return { success: true, bookingId }
  }

  // ── Queries ───────────────────────────────────────────────────────────────────

  async getMyBookings(userId: string) {
    const learnerProfile = await this.learnerProfileRepo.findByUserId(userId)
    if (!learnerProfile) return []
    return this.bookingsRepo.findAllByLearnerEnriched(learnerProfile.id)
  }

  async getCreatorBookings(userId: string, offeringId: string) {
    const creatorProfile = await this.creatorProfileRepo.findByUserId(userId)
    if (!creatorProfile) throw new UnauthorizedException()
    const offering = await this.offeringsRepo.findById(offeringId)
    if (!offering || offering.creatorProfileId !== creatorProfile.id) {
      throw new ForbiddenException('Not your offering')
    }
    return this.bookingsRepo.findAllByOffering(offeringId)
  }

  async getCreatorAllBookings(userId: string) {
    const creatorProfile = await this.creatorProfileRepo.findByUserId(userId)
    if (!creatorProfile) throw new NotFoundException('Creator profile not found')
    return this.bookingsRepo.findAllByCreator(creatorProfile.id)
  }

  /** Whether a user has a confirmed/completed booking with a creator — drives the
   *  "verified booking" flag on testimonials. */
  hasConfirmedBookingByUser(userId: string, creatorProfileId: string): Promise<boolean> {
    return this.bookingsRepo.hasConfirmedBookingByUser(userId, creatorProfileId)
  }

  /** Resolve userId → learnerProfileId, then scope the lookup to that learner.
   *  Used by UploadsService to gate digital delivery. */
  async findByIdForLearner(bookingId: string, userId: string) {
    const learnerProfile = await this.learnerProfileRepo.findByUserId(userId)
    if (!learnerProfile) return null
    return this.bookingsRepo.findByIdForLearner(bookingId, learnerProfile.id)
  }

  /**
   * Bulk-cancel all active bookings for a live_event offering (class cancellation).
   * Called from OfferingsService when a creator pauses or archives a live_event.
   * Handles per-booking refunds, earnings reversals, and calendar cleanup — same
   * logic as single cancelBooking. Returns the cancelled rows for notification.
   */
  async cancelAllForOffering(
    offeringId: string,
    creatorUserId: string,
    reason = 'Class cancelled by creator',
  ) {
    const creatorProfile = await this.creatorProfileRepo.findByUserId(creatorUserId)
    if (!creatorProfile) throw new UnauthorizedException()
    const offering = await this.offeringsRepo.findById(offeringId)
    if (!offering || offering.creatorProfileId !== creatorProfile.id) {
      throw new ForbiddenException('Not your offering')
    }

    const cancelled = await this.bookingsRepo.cancelAllActiveByOffering(offeringId, 'creator', reason)

    for (const booking of cancelled) {
      if (booking.status === 'confirmed' || booking.razorpayPaymentId) {
        void this.reverseCreatorEarning(booking.id)
      }
      if (booking.razorpayPaymentId) {
        void this.paymentService.refund(booking.razorpayPaymentId, booking.amountPaise)
          .catch(() => {})
      }
      if (booking.calendarEventId && booking.meetingProvider) {
        void this.meetingService
          .deleteMeeting(booking.meetingProvider, creatorProfile.id, booking.calendarEventId)
          .catch(() => {})
      }
    }

    return cancelled
  }
}
