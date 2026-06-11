export interface EarningsDay {
  day: string
  earnings: number
  bookings: number
}

export interface EarningsWeek {
  week: string
  earnings: number
}

export const weeklyEarnings: EarningsDay[] = [
  { day: 'Mon', earnings: 1498, bookings: 3 },
  { day: 'Tue', earnings: 2495, bookings: 5 },
  { day: 'Wed', earnings: 997, bookings: 2 },
  { day: 'Thu', earnings: 3493, bookings: 7 },
  { day: 'Fri', earnings: 1996, bookings: 4 },
  { day: 'Sat', earnings: 4491, bookings: 9 },
  { day: 'Sun', earnings: 2495, bookings: 5 },
]

export const monthlyEarnings: EarningsWeek[] = [
  { week: 'Week 1', earnings: 12400 },
  { week: 'Week 2', earnings: 15200 },
  { week: 'Week 3', earnings: 9800 },
  { week: 'Week 4', earnings: 18400 },
]

export const creatorMetrics = {
  earningsThisMonth: 18400,
  earningsLastMonth: 15082,
  earningsGrowth: 22,
  totalBookings: 38,
  bookingsThisWeek: 8,
  profileViews: 1240,
  conversionRate: 3.1,
  cqsScore: 91,
  cqsChange: 3,
  pendingPayout: 6200,
  totalEarned: 94800,
  platformFee: 10,
}
