import { Injectable } from '@nestjs/common'
import { DashboardRepository } from './dashboard.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import type { CreatorDashboardSummaryDto } from './dto/dashboard-summary.dto'

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepo: DashboardRepository,
    private readonly creatorProfileRepo: CreatorProfileRepository,
  ) {}

  async getSummary(userId: string, tz = 'Asia/Kolkata'): Promise<CreatorDashboardSummaryDto> {
    const profile = await this.creatorProfileRepo.findByUserId(userId)
    if (!profile) throw new Error('Creator profile not found')
    const creatorProfileId = profile.id

    const lastVisit = await this.dashboardRepo.getLastVisit(creatorProfileId)

    const [todaySessions, earnings, newBookings, quickStats, activityFeed, earningsTrend, bookingsTrend] = await Promise.all([
      this.dashboardRepo.findTodaySessions(creatorProfileId, tz),
      this.dashboardRepo.getEarningsSummary(creatorProfileId),
      this.dashboardRepo.findNewBookings(creatorProfileId, lastVisit),
      this.dashboardRepo.getQuickStats(creatorProfileId),
      this.dashboardRepo.getActivityFeed(creatorProfileId),
      this.dashboardRepo.getEarningsTrend(creatorProfileId),
      this.dashboardRepo.getBookingsTrend(creatorProfileId),
    ])

    // Next session only needed when no sessions today
    const nextSession = todaySessions.length === 0
      ? await this.dashboardRepo.findNextSession(creatorProfileId)
      : null

    // Mark visited after reading lastVisit so this load's new bookings are captured
    void this.dashboardRepo.markVisited(creatorProfileId)

    return { todaySessions, nextSession, earnings, newBookings, quickStats, activityFeed, earningsTrend, bookingsTrend }
  }
}
