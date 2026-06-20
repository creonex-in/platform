import { Injectable, Logger } from '@nestjs/common'
import { UsersRepository } from '../users/users.repository'
import { LearnerProfileRepository } from '../users/learner-profile.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import { sendEmail } from './channels/email.channel'
import { watiTemplates } from './channels/whatsapp.channel'
import {
  bookingConfirmedLearnerHtml,
  newBookingAlertHtml,
} from './templates/booking-confirmed.email'
import { bookingCancelledHtml } from './templates/booking-cancelled.email'
import {
  classCancelledLearnerHtml,
  classCancelledCreatorSummaryHtml,
} from './templates/class-cancelled.email'
import { digitalDeliveryHtml } from './templates/digital-delivery.email'

/** Minimal booking fields needed for notifications. */
interface BookingForNotification {
  id: string
  offeringId: string
  learnerProfileId: string | null
  guestEmail: string | null
  guestName: string | null
  guestPhone: string | null
  startTime: Date | null
  learnerTimezone: string | null
  meetingUrl: string | null
  razorpayPaymentId: string | null
  status: string
}

/** Minimal offering fields needed for notifications. */
interface OfferingForNotification {
  id: string
  title: string
  creatorProfileId: string
  type: string
  metadata?: { instructions?: string } | null
}

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'https://creonex.in'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly learnerProfileRepo: LearnerProfileRepository,
    private readonly creatorProfileRepo: CreatorProfileRepository,
  ) {}

  private formatDate(date: Date | null, timezone: string | null): string {
    if (!date) return ''
    try {
      return date.toLocaleString('en-IN', {
        timeZone: timezone ?? 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'short',
      })
    } catch {
      return date.toUTCString()
    }
  }

  private async resolveLearnerContact(booking: BookingForNotification) {
    if (booking.guestEmail) {
      return {
        email: booking.guestEmail,
        name: booking.guestName ?? 'Learner',
        phone: booking.guestPhone ?? undefined,
      }
    }
    if (!booking.learnerProfileId) return null
    const profile = await this.learnerProfileRepo.findById(booking.learnerProfileId)
    if (!profile) return null
    const user = await this.usersRepo.findById(profile.userId)
    if (!user?.email) return null
    return { email: user.email, name: user.name, phone: user.phone ?? undefined }
  }

  private async resolveCreatorContact(creatorProfileId: string) {
    const profile = await this.creatorProfileRepo.findById(creatorProfileId)
    if (!profile) return null
    const user = await this.usersRepo.findById(profile.userId)
    if (!user?.email) return null
    return { email: user.email, name: profile.displayName ?? user.name, phone: user.phone ?? undefined }
  }

  async notifyBookingConfirmed(
    booking: BookingForNotification,
    offering: OfferingForNotification,
  ): Promise<void> {
    try {
      const [learner, creator] = await Promise.all([
        this.resolveLearnerContact(booking),
        this.resolveCreatorContact(offering.creatorProfileId),
      ])
      const sessionDate = this.formatDate(booking.startTime, booking.learnerTimezone)

      await Promise.allSettled([
        learner?.email
          ? sendEmail(
              learner.email,
              `Booking confirmed — ${offering.title}`,
              bookingConfirmedLearnerHtml({
                learnerName: learner.name,
                offeringTitle: offering.title,
                creatorName: creator?.name ?? 'your creator',
                sessionDate,
                meetingUrl: booking.meetingUrl,
                bookingId: booking.id,
              }),
            )
          : Promise.resolve(),
        learner?.phone
          ? watiTemplates.bookingConfirmedLearner(
              learner.phone,
              learner.name,
              offering.title,
              sessionDate,
              booking.meetingUrl,
            )
          : Promise.resolve(),
        creator?.email
          ? sendEmail(
              creator.email,
              `New booking — ${offering.title}`,
              newBookingAlertHtml({
                creatorName: creator.name,
                learnerName: learner?.name ?? 'A learner',
                offeringTitle: offering.title,
                sessionDate,
                bookingId: booking.id,
              }),
            )
          : Promise.resolve(),
        creator?.phone
          ? watiTemplates.newBookingCreator(
              creator.phone,
              creator.name,
              learner?.name ?? 'A learner',
              offering.title,
              sessionDate,
            )
          : Promise.resolve(),
      ])
    } catch (err) {
      this.logger.warn(`notifyBookingConfirmed failed for booking ${booking.id}: ${String(err)}`)
    }
  }

  async notifyBookingCancelled(
    booking: BookingForNotification,
    offering: OfferingForNotification,
    cancelledBy: string,
  ): Promise<void> {
    try {
      const [learner, creator] = await Promise.all([
        this.resolveLearnerContact(booking),
        this.resolveCreatorContact(offering.creatorProfileId),
      ])
      const hadPayment = !!booking.razorpayPaymentId

      await Promise.allSettled([
        learner?.email
          ? sendEmail(
              learner.email,
              `Booking cancelled — ${offering.title}`,
              bookingCancelledHtml({
                recipientName: learner.name,
                offeringTitle: offering.title,
                cancelledBy,
                hadPayment,
                bookingId: booking.id,
              }),
            )
          : Promise.resolve(),
        learner?.phone
          ? watiTemplates.bookingCancelledLearner(learner.phone, learner.name, offering.title)
          : Promise.resolve(),
        creator?.email && cancelledBy !== 'creator'
          ? sendEmail(
              creator.email,
              `Booking cancelled — ${offering.title}`,
              bookingCancelledHtml({
                recipientName: creator.name,
                offeringTitle: offering.title,
                cancelledBy,
                hadPayment: false,
                bookingId: booking.id,
              }),
            )
          : Promise.resolve(),
      ])
    } catch (err) {
      this.logger.warn(`notifyBookingCancelled failed for booking ${booking.id}: ${String(err)}`)
    }
  }

  async notifyClassCancelled(
    cancelledBookings: BookingForNotification[],
    offering: OfferingForNotification,
  ): Promise<void> {
    try {
      const creator = await this.resolveCreatorContact(offering.creatorProfileId)

      await Promise.allSettled([
        // One email per affected learner
        ...cancelledBookings.map(async (booking) => {
          try {
            const learner = await this.resolveLearnerContact(booking)
            if (!learner) return
            const creatorName = creator?.name ?? 'the creator'
            await Promise.allSettled([
              learner.email
                ? sendEmail(
                    learner.email,
                    `Class cancelled — ${offering.title}`,
                    classCancelledLearnerHtml({
                      learnerName: learner.name,
                      offeringTitle: offering.title,
                      creatorName,
                      sessionDate: this.formatDate(booking.startTime, booking.learnerTimezone),
                      hadPayment: !!booking.razorpayPaymentId,
                      bookingId: booking.id,
                    }),
                  )
                : Promise.resolve(),
              learner.phone
                ? watiTemplates.classCancelledLearner(
                    learner.phone,
                    learner.name,
                    offering.title,
                    creatorName,
                  )
                : Promise.resolve(),
            ])
          } catch (err) {
            this.logger.warn(`classCancelled learner notify failed for booking ${booking.id}: ${String(err)}`)
          }
        }),
        // One summary email to creator
        creator?.email
          ? sendEmail(
              creator.email,
              `Class cancellation confirmed — ${offering.title}`,
              classCancelledCreatorSummaryHtml({
                creatorName: creator.name,
                offeringTitle: offering.title,
                cancelledCount: cancelledBookings.length,
              }),
            )
          : Promise.resolve(),
      ])
    } catch (err) {
      this.logger.warn(`notifyClassCancelled failed for offering ${offering.id}: ${String(err)}`)
    }
  }

  async notifyDigitalDelivery(
    booking: BookingForNotification,
    offering: OfferingForNotification,
  ): Promise<void> {
    try {
      const learner = await this.resolveLearnerContact(booking)
      if (!learner?.email) return
      const creator = await this.resolveCreatorContact(offering.creatorProfileId)
      const libraryUrl = `${WEB_URL}/learner/library`

      await Promise.allSettled([
        learner.email
          ? sendEmail(
              learner.email,
              `Your purchase is ready — ${offering.title}`,
              digitalDeliveryHtml({
                learnerName: learner.name,
                offeringTitle: offering.title,
                creatorName: creator?.name ?? 'the creator',
                libraryUrl,
                instructions: offering.metadata?.instructions ?? null,
              }),
            )
          : Promise.resolve(),
        learner.phone
          ? watiTemplates.digitalDelivery(learner.phone, learner.name, offering.title, libraryUrl)
          : Promise.resolve(),
      ])
    } catch (err) {
      this.logger.warn(`notifyDigitalDelivery failed for booking ${booking.id}: ${String(err)}`)
    }
  }
}
