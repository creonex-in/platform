export interface CQSSignals {
  rating: number
  completionRate: number
  responseScore: number
  rebookingRate: number
  profileQuality: number
  recencyScore: number
}

export interface Creator {
  id: string
  username: string
  name: string
  initials: string
  niche: string
  bio: string
  avatar?: string
  followers: number
  rating: number
  reviewCount: number
  cqsScore: number
  cqsTier: 'rising' | 'verified' | 'elite'
  totalBookings: number
  completionRate: number
  responseTime: string
  rebookingRate: number
  sessionPrice: number
  workshopPrice?: number
  isLive: boolean
  inBoost?: boolean
  tags: string[]
  signals: CQSSignals
}
