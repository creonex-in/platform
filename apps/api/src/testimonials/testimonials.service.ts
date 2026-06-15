import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { TestimonialsRepository } from '../users/testimonials.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import { BookingsService } from '../bookings/bookings.service'
import type { SubmitTestimonialDto, UpdateVisibilityDto } from './testimonials.dto'

@Injectable()
export class TestimonialsService {
  constructor(
    private readonly testimonialsRepo: TestimonialsRepository,
    private readonly creatorProfileRepo: CreatorProfileRepository,
    private readonly bookingsService: BookingsService,
  ) {}

  async getCreatorTestimonials(userId: string) {
    const profile = await this.creatorProfileRepo.findByUserId(userId)
    if (!profile) throw new NotFoundException('Creator profile not found')
    return this.testimonialsRepo.findAllByCreatorProfileId(profile.id)
  }

  async updateVisibility(userId: string, id: string, dto: UpdateVisibilityDto) {
    const profile = await this.creatorProfileRepo.findByUserId(userId)
    if (!profile) throw new NotFoundException('Creator profile not found')
    await this.testimonialsRepo.updateVisibility(id, profile.id, dto.isPublic)
  }

  async submitTestimonial(
    username: string,
    userId: string,
    dto: SubmitTestimonialDto,
  ): Promise<void> {
    const profile = await this.creatorProfileRepo.findPublicByUsername(username)
    if (!profile) throw new NotFoundException('Creator not found')

    // A creator can't review their own profile.
    if (profile.userId === userId) {
      throw new ForbiddenException('You cannot review your own profile')
    }

    // One review per user per creator (unique index is the hard guard; this gives a
    // clean message before hitting it).
    if (await this.testimonialsRepo.existsForUser(userId, profile.id)) {
      throw new ConflictException('You have already reviewed this creator')
    }

    const isVerified = await this.bookingsService.hasConfirmedBookingByUser(userId, profile.id)

    await this.testimonialsRepo.create({
      creatorProfileId: profile.id,
      userId,
      learnerName: dto.learnerName,
      learnerRole: dto.learnerRole,
      content: dto.content,
      rating: dto.rating,
      isVerified,
    })
  }
}
