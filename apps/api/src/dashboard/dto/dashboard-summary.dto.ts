import { ApiProperty } from '@nestjs/swagger'
import type { CreatorBookingItem } from '@creonex/types'

export class EarningsSummaryDto {
  @ApiProperty() thisWeekPaise!: number
  @ApiProperty() thisMonthPaise!: number
  @ApiProperty() pendingPaise!: number
}

export class QuickStatsDto {
  @ApiProperty() totalSessions!: number
  @ApiProperty() totalReviews!: number
  @ApiProperty() avgRating!: number
  @ApiProperty() nicheRank!: number
  @ApiProperty() nicheTotal!: number
}

export class ActivityFeedItemDto {
  @ApiProperty() id!: string
  @ApiProperty({ enum: ['payout', 'review', 'booking'] }) type!: 'payout' | 'review' | 'booking'
  @ApiProperty() message!: string
  @ApiProperty() occurredAt!: string
}

export class EarningsTrendPointDto {
  @ApiProperty() week!: string
  @ApiProperty() earningsPaise!: number
}

export class BookingsTrendPointDto {
  @ApiProperty() date!: string
  @ApiProperty() count!: number
}

export class CreatorDashboardSummaryDto {
  @ApiProperty({ type: 'array' }) todaySessions!: CreatorBookingItem[]
  @ApiProperty({ nullable: true }) nextSession!: CreatorBookingItem | null
  @ApiProperty() earnings!: EarningsSummaryDto
  @ApiProperty({ type: 'array' }) newBookings!: CreatorBookingItem[]
  @ApiProperty() quickStats!: QuickStatsDto
  @ApiProperty({ type: () => [ActivityFeedItemDto] }) activityFeed!: ActivityFeedItemDto[]
  @ApiProperty({ type: () => [EarningsTrendPointDto] }) earningsTrend!: EarningsTrendPointDto[]
  @ApiProperty({ type: () => [BookingsTrendPointDto] }) bookingsTrend!: BookingsTrendPointDto[]
}
