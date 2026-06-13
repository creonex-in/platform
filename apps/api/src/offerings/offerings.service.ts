import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { OfferingsRepository } from '../users/offerings.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import type { OfferStatus } from '@creonex/types'
import type { CreateOfferingDto, UpdateOfferingDto } from './offerings.dto'

const VALID_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  draft: ['live', 'archived'],
  live: ['paused', 'archived'],
  paused: ['live', 'archived'],
  archived: [],
}

@Injectable()
export class OfferingsService {
  constructor(
    private readonly offeringsRepo: OfferingsRepository,
    private readonly creatorProfileRepo: CreatorProfileRepository,
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

  async createOffering(userId: string, dto: CreateOfferingDto) {
    const profileId = await this.resolveCreatorProfileId(userId)
    const id = await this.offeringsRepo.create({
      creatorProfileId: profileId,
      type: dto.type,
      title: dto.title,
      priceInPaise: dto.price * 100,
      durationMinutes: dto.durationMinutes,
      seatsTotal: dto.seatsTotal,
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

    await this.offeringsRepo.update(id, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.price !== undefined && { price: dto.price * 100 }),
      ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
      ...(dto.seatsTotal !== undefined && { seatsTotal: dto.seatsTotal }),
      ...(dto.minNoticeMinutes !== undefined && { minNoticeMinutes: dto.minNoticeMinutes }),
      ...(dto.bookingWindowDays !== undefined && { bookingWindowDays: dto.bookingWindowDays }),
      ...(dto.bufferAfterMinutes !== undefined && { bufferAfterMinutes: dto.bufferAfterMinutes }),
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
    return { id, status: newStatus }
  }
}
