export interface PriorityDM {
  id: string
  name: string
  initials: string
  question: string
  amount: number
  date: string
  answered: boolean
}

export const mockPriorityDMs: PriorityDM[] = []

export const analyticsSummary = {
  totalViews: 1240,
  viewsChange: 12,
  conversionRate: 3.1,
  conversionChange: 0.4,
  avgRating: 4.9,
  repeatRate: 72,
}

export const topOffers = [
  { title: 'UX Case Study Template Pack', bookings: 112, revenue: 22288 },
  { title: '1:1 UI/UX Portfolio Review', bookings: 38, revenue: 18962 },
  { title: 'UX Research Deep Dive', bookings: 24, revenue: 14376 },
]
