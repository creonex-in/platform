import { Injectable, NotFoundException } from '@nestjs/common'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import { OfferingsRepository } from '../users/offerings.repository'
import { TestimonialsRepository } from '../users/testimonials.repository'
import { UsersRepository } from '../users/users.repository'

@Injectable()
export class CreatorsService {
  constructor(
    private readonly creatorProfileRepo: CreatorProfileRepository,
    private readonly offeringsRepo: OfferingsRepository,
    private readonly testimonialsRepo: TestimonialsRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async getPublicProfile(username: string) {
    const profile = await this.creatorProfileRepo.findPublicByUsername(username)

    if (!profile || !profile.isLive) {
      throw new NotFoundException(`Creator @${username} not found`)
    }

    const [offerings, testimonials, user] = await Promise.all([
      this.offeringsRepo.findPublicByCreatorProfileId(profile.id),
      this.testimonialsRepo.findPublicByCreatorProfileId(profile.id),
      this.usersRepo.findById(profile.userId),
    ])

    return {
      id: profile.id,
      username: profile.username!,
      displayName: profile.displayName,
      bio: profile.bio,
      profilePhotoUrl: profile.profilePhotoUrl,
      coverBannerUrl: profile.coverBannerUrl,
      primaryNiche: profile.primaryNiche,
      experienceYears: profile.experienceYears,
      languages: profile.languages ?? [],
      socialLinks: profile.socialLinks ?? {},
      qualityTier: profile.qualityTier,
      smoothedRating: profile.smoothedRating,
      totalReviews: profile.totalReviews,
      totalSessions: profile.totalSessions,
      isVerified: profile.isVerified,
      tags: profile.tags,
      email: user?.email ?? '',
      offerings: offerings.map((o) => ({
        id: o.id,
        type: o.type,
        title: o.title,
        price: Math.round(o.price / 100),
        currency: o.currency,
        durationMinutes: o.durationMinutes ?? null,
        seatsTotal: o.seatsTotal ?? null,
        seatsRemaining: o.seatsRemaining ?? null,
        status: o.status,
        totalBookings: o.totalBookings,
        description: o.description ?? null,
        thumbnailUrl: o.thumbnailUrl ?? null,
      })),
      testimonials: testimonials.map((t) => ({
        id: t.id,
        learnerName: t.learnerName,
        learnerRole: t.learnerRole ?? null,
        content: t.content,
        rating: t.rating,
      })),
    }
  }
}
