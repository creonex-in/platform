import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { BookingsRepository } from './bookings.repository'
import { LearnerProfileRepository } from '../users/learner-profile.repository'
import { OfferingsRepository } from '../users/offerings.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import { PaymentService } from '../payment/payment.service'
import { MeetingService } from '../meeting/meeting.service'
import { SlotGenerationService } from '../availability/slot-generation.service'
import type { CreateBookingDto, CreateGuestBookingDto, ConfirmBookingDto, CancelBookingDto } from './bookings.dto'

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepo: BookingsRepository,
    private readonly learnerProfileRepo: LearnerProfileRepository,
    private readonly offeringsRepo: OfferingsRepository,
    private readonly creatorProfileRepo: CreatorProfileRepository,
    private readonly paymentService: PaymentService,
    private readonly meetingService: MeetingService,
    private readonly slotService: SlotGenerationService,
  ) {}

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

    // Slot validation + server-derived times for one_on_one
    let startTime: Date | undefined
    let endTime: Date | undefined
    if (offering.type === 'one_on_one') {
      if (!dto.startTime) {
        throw new BadRequestException('startTime is required for 1:1 bookings')
      }
      ;({ startTime, endTime } = await this.validateSlot(offering, dto.startTime, dto.learnerTimezone))
    } else {
      startTime = dto.startTime ? new Date(dto.startTime) : undefined
      endTime = dto.endTime ? new Date(dto.endTime) : undefined
    }

    // Seat check for group/workshop
    if ((offering.type === 'group' || offering.type === 'workshop') && offering.seatsTotal !== null) {
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

    // Atomic seat decrement for group types
    if ((offering.type === 'group' || offering.type === 'workshop') && offering.seatsTotal !== null) {
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

    let startTime: Date | undefined
    let endTime: Date | undefined
    if (offering.type === 'one_on_one') {
      if (!dto.startTime) {
        throw new BadRequestException('startTime is required for 1:1 bookings')
      }
      ;({ startTime, endTime } = await this.validateSlot(offering, dto.startTime, dto.learnerTimezone))
    } else {
      startTime = dto.startTime ? new Date(dto.startTime) : undefined
      endTime = dto.endTime ? new Date(dto.endTime) : undefined
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

    if ((offering.type === 'group' || offering.type === 'workshop') && offering.seatsTotal !== null) {
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

    const meeting = await this.meetingService.createMeeting(
      this.meetingService.getDefaultProvider(),
      {
        creatorProfileId: offering.creatorProfileId,
        title: offering.title,
        startTime: booking.startTime!,
        endTime: booking.endTime!,
        description: booking.topic ?? undefined,
      },
    ).catch(() => null)

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
    const meeting = await this.meetingService.createMeeting(
      this.meetingService.getDefaultProvider(),
      {
        creatorProfileId: offering.creatorProfileId,
        title: offering.title,
        startTime: booking.startTime!,
        endTime: booking.endTime!,
        description: booking.topic ?? undefined,
      },
    ).catch(() => null)

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

    return this.bookingsRepo.findById(bookingId)
  }

  // ── Internal confirm (called from webhook) ────────────────────────────────────

  async confirmFromWebhook(razorpayOrderId: string, razorpayPaymentId: string) {
    const booking = await this.bookingsRepo.findByRazorpayOrderId(razorpayOrderId)
    if (!booking || booking.status !== 'pending_payment') return

    const offering = await this.offeringsRepo.findById(booking.offeringId)
    if (!offering) return

    const meeting = await this.meetingService.createMeeting(
      this.meetingService.getDefaultProvider(),
      {
        creatorProfileId: offering.creatorProfileId,
        title: offering.title,
        startTime: booking.startTime!,
        endTime: booking.endTime!,
        description: booking.topic ?? undefined,
      },
    ).catch(() => null)

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
    }

    // Restore seat for group/workshop
    const offering = await this.offeringsRepo.findById(booking.offeringId)
    if (offering && (offering.type === 'group' || offering.type === 'workshop') && offering.seatsTotal !== null) {
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

    return { success: true, bookingId }
  }

  // ── Queries ───────────────────────────────────────────────────────────────────

  async getMyBookings(userId: string) {
    const learnerProfile = await this.learnerProfileRepo.findByUserId(userId)
    if (!learnerProfile) return []
    return this.bookingsRepo.findAllByLearner(learnerProfile.id)
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
}
