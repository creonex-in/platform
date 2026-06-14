import { Injectable, NotFoundException } from '@nestjs/common'
import { TestimonialsRepository } from '../users/testimonials.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import type { SubmitTestimonialDto, UpdateVisibilityDto } from './testimonials.dto'

@Injectable()
export class TestimonialsService {
  constructor(
    private readonly testimonialsRepo: TestimonialsRepository,
    private readonly creatorProfileRepo: CreatorProfileRepository,
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

  async submitTestimonial(username: string, dto: SubmitTestimonialDto): Promise<void> {
    const profile = await this.creatorProfileRepo.findPublicByUsername(username)
    if (!profile) throw new NotFoundException('Creator not found')
    await this.testimonialsRepo.create({
      creatorProfileId: profile.id,
      learnerName: dto.learnerName,
      learnerRole: dto.learnerRole,
      content: dto.content,
      rating: dto.rating,
    })
  }
}
