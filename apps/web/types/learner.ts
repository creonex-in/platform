import type { OfferType } from './offer'
import type { Creator } from './creator'
import type { CourseProgress } from './resource'

export type AgendaKind = 'session' | 'workshop' | 'group'

export interface AgendaItem {
  id: string
  title: string
  host: string
  hostInitials: string
  date: string
  duration?: number
  kind: AgendaKind
  href: string
  seatsLeft?: number
}

export interface LearnerDashboardData {
  learner: { name: string; initials: string }
  upcomingSessions: AgendaItem[]
  upcomingWorkshops: AgendaItem[]
  courses: CourseProgress[]
}

export interface Purchase {
  id: string
  creatorName: string
  creatorInitials: string
  offerTitle: string
  offerType: OfferType
  purchasedAt: string
  price: number
  completed: boolean
  rated: boolean
  rating?: number
}

export interface SavedCreator extends Creator {
  savedAt: string
}
