import { Injectable, NotFoundException } from '@nestjs/common'
import { LearnerRepository } from './learner.repository'
import { LearnerProfileRepository } from '../users/learner-profile.repository'
import { BookingsService } from '../bookings/bookings.service'
import type {
  CreateSavedDto, CreateNoteDto, UpdateNoteDto,
} from './learner.dto'
import type { LearnerOverview } from '@creonex/types'

@Injectable()
export class LearnerService {
  constructor(
    private readonly learnerRepo: LearnerRepository,
    private readonly learnerProfileRepo: LearnerProfileRepository,
    private readonly bookingsService: BookingsService,
  ) {}

  private async resolveProfileId(userId: string): Promise<string> {
    const profile = await this.learnerProfileRepo.findByUserId(userId)
    if (!profile) throw new NotFoundException('Learner profile not found')
    return profile.id
  }

  // ── Saved ──
  async listSaved(userId: string) {
    return this.learnerRepo.listSaved(await this.resolveProfileId(userId))
  }
  async addSaved(userId: string, dto: CreateSavedDto) {
    const profileId = await this.resolveProfileId(userId)
    const id = await this.learnerRepo.createSaved(profileId, dto.targetType, dto.targetId)
    return { id, ...dto }
  }
  async removeSaved(userId: string, dto: CreateSavedDto) {
    const profileId = await this.resolveProfileId(userId)
    await this.learnerRepo.deleteSavedByTarget(profileId, dto.targetType, dto.targetId)
    return { success: true }
  }

  // ── Notes ──
  async listNotes(userId: string) {
    return this.learnerRepo.listNotes(await this.resolveProfileId(userId))
  }
  async createNote(userId: string, dto: CreateNoteDto) {
    const profileId = await this.resolveProfileId(userId)
    const id = await this.learnerRepo.createNote(profileId, dto)
    return this.learnerRepo.findNote(id, profileId)
  }
  async updateNote(userId: string, id: string, dto: UpdateNoteDto) {
    const profileId = await this.resolveProfileId(userId)
    const existing = await this.learnerRepo.findNote(id, profileId)
    if (!existing) throw new NotFoundException('Note not found')
    await this.learnerRepo.updateNote(id, profileId, dto)
    return this.learnerRepo.findNote(id, profileId)
  }
  async deleteNote(userId: string, id: string) {
    const profileId = await this.resolveProfileId(userId)
    await this.learnerRepo.deleteNote(id, profileId)
    return { success: true }
  }

  // ── Overview (home/hub aggregate) ──
  async getOverview(userId: string): Promise<LearnerOverview> {
    const profileId = await this.resolveProfileId(userId)
    const [bookings, savedCount] = await Promise.all([
      this.bookingsService.getMyBookings(userId),
      this.learnerRepo.countSaved(profileId),
    ])

    const now = Date.now()
    const upcoming = bookings
      .filter(
        (b) =>
          b.offeringType !== 'digital' &&
          b.status === 'confirmed' &&
          b.startTime != null &&
          new Date(b.startTime).getTime() >= now,
      )
      .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime())

    const digital = bookings.filter(
      (b) => b.offeringType === 'digital' && (b.status === 'confirmed' || b.status === 'completed'),
    )

    return {
      nextSession: (upcoming[0] as unknown as LearnerOverview['nextSession']) ?? null,
      upcomingCount: upcoming.length,
      recentDigital: digital.slice(0, 4) as unknown as LearnerOverview['recentDigital'],
      digitalCount: digital.length,
      savedCount,
    }
  }
}
