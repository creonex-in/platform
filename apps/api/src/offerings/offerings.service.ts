import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { OfferingsRepository } from '../users/offerings.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import { BookingsService } from '../bookings/bookings.service'
import { NotificationsService } from '../notifications/notifications.service'
import {
  GATED_OFFER_TYPES,
  SESSIONS_TO_UNLOCK_OFFERS,
  type CreatorOfferStats,
  type OfferCreationEligibility,
  type OfferingMetadata,
  type OfferStatus,
  type OfferType,
} from '@creonex/types'
import type { CreateOfferingDto, UpdateOfferingDto } from './offerings.dto'

const GATED_TYPES = new Set<OfferType>(GATED_OFFER_TYPES)

/** Build the `metadata` jsonb from the per-type DTO fields (format / digital delivery). */
function buildMetadata(
  dto: CreateOfferingDto | UpdateOfferingDto,
  base: OfferingMetadata = {},
): OfferingMetadata {
  const m: OfferingMetadata = { ...base }
  if (dto.format !== undefined) m.format = dto.format
  if (dto.deliveryFiles !== undefined) m.files = dto.deliveryFiles
  if (dto.externalUrl !== undefined) m.externalUrl = dto.externalUrl
  if (dto.deliveryInstructions !== undefined) m.instructions = dto.deliveryInstructions
  return m
}

const VALID_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  draft: ['live', 'archived'],
  live: ['paused', 'archived'],
  paused: ['live', 'archived'],
  // Archive is reversible: restore brings the offer back as a hidden, editable
  // draft so the creator can review before republishing. Delete stays the only
  // permanent path.
  archived: ['draft'],
}

@Injectable()
export class OfferingsService {
  constructor(
    private readonly offeringsRepo: OfferingsRepository,
    private readonly creatorProfileRepo: CreatorProfileRepository,
    private readonly bookingsService: BookingsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async resolveCreatorProfileId(userId: string): Promise<string> {
    const profile = await this.creatorProfileRepo.findByUserId(userId)
    if (!profile) throw new NotFoundException('Creator profile not found')
    return profile.id
  }

  private formatOffering(o: Awaited<ReturnType<OfferingsRepository['findById']>>) {
    if (!o) return null
    return {
      id: o.id,
      type: o.type,
      title: o.title,
      description: o.description,
      price: Math.round(o.price / 100),
      currency: o.currency,
      durationMinutes: o.durationMinutes,
      seatsTotal: o.seatsTotal,
      seatsRemaining: o.seatsRemaining,
      status: o.status,
      totalBookings: o.totalBookings,
      totalRevenuePaise: o.totalRevenuePaise,
      thumbnailUrl: o.thumbnailUrl,
      minNoticeMinutes: o.minNoticeMinutes,
      bookingWindowDays: o.bookingWindowDays,
      bufferAfterMinutes: o.bufferAfterMinutes,
      scheduleId: o.scheduleId,
      scheduledAt: o.scheduledAt,
      metadata: (o.metadata ?? {}) as OfferingMetadata,
      slug: o.slug,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }
  }

  async getMyOfferings(userId: string) {
    const profileId = await this.resolveCreatorProfileId(userId)
    const rows = await this.offeringsRepo.findAllByCreatorProfileId(profileId)
    return rows.map((o) => this.formatOffering(o)!)
  }

  /** Aggregate stats for the /offers dashboard — server-computed from real rows. */
  async getOfferingStats(userId: string): Promise<CreatorOfferStats> {
    const profileId = await this.resolveCreatorProfileId(userId)
    const s = await this.offeringsRepo.getStats(profileId)
    return {
      totalOffers: s.totalOffers,
      liveOffers: s.liveOffers,
      totalBookings: s.totalBookings,
      totalRevenue: Math.round(s.totalRevenuePaise / 100),
    }
  }

  /**
   * Whether the creator may create gated offer types yet. Group calls and
   * workshops unlock after delivering {@link SESSIONS_TO_UNLOCK_OFFERS} 1:1 sessions.
   */
  async getCreationEligibility(userId: string): Promise<OfferCreationEligibility> {
    const profileId = await this.resolveCreatorProfileId(userId)
    const completed = await this.offeringsRepo.countCompletedOneOnOneSessions(profileId)
    const unlocked = completed >= SESSIONS_TO_UNLOCK_OFFERS
    return {
      completedOneOnOneSessions: completed,
      requiredSessions: SESSIONS_TO_UNLOCK_OFFERS,
      unlocked,
      lockedTypes: unlocked ? [] : [...GATED_OFFER_TYPES],
    }
  }

  async createOffering(userId: string, dto: CreateOfferingDto) {
    const profileId = await this.resolveCreatorProfileId(userId)

    // Gate live events (group calls / webinars) behind delivered 1:1 sessions.
    if (GATED_TYPES.has(dto.type)) {
      const completed = await this.offeringsRepo.countCompletedOneOnOneSessions(profileId)
      if (completed < SESSIONS_TO_UNLOCK_OFFERS) {
        throw new ForbiddenException(
          `Complete ${SESSIONS_TO_UNLOCK_OFFERS} one-on-one sessions to unlock live events (group calls & webinars). You've completed ${completed}.`,
        )
      }
    }
    const id = await this.offeringsRepo.create({
      creatorProfileId: profileId,
      type: dto.type,
      title: dto.title,
      priceInPaise: dto.price * 100,
      durationMinutes: dto.durationMinutes,
      seatsTotal: dto.seatsTotal,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      metadata: buildMetadata(dto) as Record<string, unknown>,
      status: 'draft',
    })

    // Apply optional scheduling fields not in the base create
    if (
      dto.minNoticeMinutes !== undefined ||
      dto.bookingWindowDays !== undefined ||
      dto.bufferAfterMinutes !== undefined ||
      dto.description !== undefined
    ) {
      await this.offeringsRepo.update(id, {
        description: dto.description ?? null,
        minNoticeMinutes: dto.minNoticeMinutes,
        bookingWindowDays: dto.bookingWindowDays,
        bufferAfterMinutes: dto.bufferAfterMinutes,
      })
    }

    const created = await this.offeringsRepo.findById(id)
    return this.formatOffering(created)!
  }

  async getOffering(id: string, userId: string) {
    const profileId = await this.resolveCreatorProfileId(userId)
    const offering = await this.offeringsRepo.findByIdForOwner(id, profileId)
    if (!offering) throw new NotFoundException('Offering not found')
    return this.formatOffering(offering)!
  }

  async updateOffering(id: string, userId: string, dto: UpdateOfferingDto) {
    const profileId = await this.resolveCreatorProfileId(userId)
    const offering = await this.offeringsRepo.findByIdForOwner(id, profileId)
    if (!offering) throw new NotFoundException('Offering not found')
    if (offering.status === 'archived') {
      throw new ForbiddenException('Archived offerings cannot be modified')
    }

    // Merge metadata fields onto the existing jsonb so partial updates don't clobber it.
    const metadataTouched =
      dto.format !== undefined ||
      dto.deliveryFiles !== undefined ||
      dto.externalUrl !== undefined ||
      dto.deliveryInstructions !== undefined

    await this.offeringsRepo.update(id, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.price !== undefined && { price: dto.price * 100 }),
      ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
      ...(dto.seatsTotal !== undefined && { seatsTotal: dto.seatsTotal }),
      ...(dto.minNoticeMinutes !== undefined && { minNoticeMinutes: dto.minNoticeMinutes }),
      ...(dto.bookingWindowDays !== undefined && { bookingWindowDays: dto.bookingWindowDays }),
      ...(dto.bufferAfterMinutes !== undefined && { bufferAfterMinutes: dto.bufferAfterMinutes }),
      ...(dto.scheduledAt !== undefined && { scheduledAt: new Date(dto.scheduledAt) }),
      ...(metadataTouched && {
        metadata: buildMetadata(dto, (offering.metadata ?? {}) as OfferingMetadata) as Record<string, unknown>,
      }),
    })

    const updated = await this.offeringsRepo.findById(id)
    return this.formatOffering(updated)!
  }

  async transitionStatus(id: string, userId: string, newStatus: OfferStatus) {
    const profileId = await this.resolveCreatorProfileId(userId)
    const offering = await this.offeringsRepo.findByIdForOwner(id, profileId)
    if (!offering) throw new NotFoundException('Offering not found')

    const allowed = VALID_TRANSITIONS[offering.status as OfferStatus] ?? []
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from '${offering.status}' to '${newStatus}'`,
      )
    }

    await this.offeringsRepo.updateStatus(id, newStatus)

    // When a live_event is paused or archived, bulk-cancel active bookings + notify learners.
    if (offering.type === 'live_event' && (newStatus === 'paused' || newStatus === 'archived')) {
      void (async () => {
        try {
          const cancelled = await this.bookingsService.cancelAllForOffering(id, userId)
          if (cancelled.length > 0) {
            void this.notificationsService.notifyClassCancelled(cancelled, {
              id: offering.id,
              title: offering.title,
              creatorProfileId: offering.creatorProfileId,
              type: offering.type,
              metadata: (offering.metadata as { instructions?: string }) ?? null,
            })
          }
        } catch {
          // Never surface — status transition already succeeded
        }
      })()
    }

    return { id, status: newStatus }
  }

  /**
   * Hard delete an offering. Only permitted for a `draft` with zero bookings —
   * anything live/paused/archived or with booking history must be archived
   * instead (preserves payment + booking records). Guarded server-side; the
   * UI gate is convenience only.
   */
  /** Raw lookup by ID — for internal cross-module use (e.g. UploadsService digital delivery). */
  async findById(id: string) {
    const row = await this.offeringsRepo.findById(id)
    return this.formatOffering(row)
  }

  /** Verify that an offering belongs to the calling user's creator profile. Throws ForbiddenException if not. */
  async verifyOwnership(offeringId: string, userId: string): Promise<void> {
    const profileId = await this.resolveCreatorProfileId(userId)
    const offering = await this.offeringsRepo.findByIdForOwner(offeringId, profileId)
    if (!offering) throw new ForbiddenException('Offering not found or does not belong to this creator')
  }

  async deleteOffering(id: string, userId: string) {
    const profileId = await this.resolveCreatorProfileId(userId)
    const offering = await this.offeringsRepo.findByIdForOwner(id, profileId)
    if (!offering) throw new NotFoundException('Offering not found')

    if (offering.status !== 'draft') {
      throw new ConflictException(
        'Only draft offers can be deleted. Archive live, paused, or archived offers instead.',
      )
    }

    // Backstop: never delete an offering that has any booking rows, even if the
    // cached counter says zero (bookings cascade-delete on the FK).
    const bookingCount = await this.offeringsRepo.countBookings(id)
    if (bookingCount > 0) {
      throw new ConflictException(
        'This offer has bookings and cannot be deleted. Archive it instead.',
      )
    }

    await this.offeringsRepo.delete(id)
    return { id, deleted: true }
  }
}
