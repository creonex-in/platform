import 'server-only'
import type { LearnerDashboardData } from '@/types/learner'
import type { Course } from '@/types/course'
import type { Offer } from '@/types/offer'
import type { Creator } from '@/types/creator'
import type { Resource, CourseProgress, LearnerNote } from '@/types/resource'
import { mockCourses } from '@/data/mock-courses'
import { mockOffers } from '@/data/mock-offers'
import { mockCreators, featuredCreators } from '@/data/mock-creators'
import {
  mockResources,
  resourceCategories,
  continueLearning,
  mockNotes,
} from '@/data/mock-resources'

/*
 * Server-only data access for the learner area.
 *
 * TODO(backend): each function currently returns mock data. Swap the body for a
 * service/API call (use Promise.all when a screen needs several sources) and keep
 * the return shapes stable so the pages and UI don't change.
 */

const LEARNER = { name: 'Arjun Kumar', initials: 'AK' }

export async function getLearnerDashboard(): Promise<LearnerDashboardData> {
  return {
    learner: LEARNER,
    upcomingSessions: [
      {
        id: 'us1',
        title: '1:1 UI/UX Portfolio Review',
        host: 'Meera Venkatesh',
        hostInitials: 'MV',
        date: 'Tomorrow, 5:00 PM',
        duration: 45,
        kind: 'session',
        href: '/learner/sessions',
      },
      {
        id: 'us2',
        title: 'DSA Interview Prep',
        host: 'Rohit Sharma',
        hostInitials: 'RS',
        date: 'Thu, 12 Jun · 7:30 PM',
        duration: 60,
        kind: 'session',
        href: '/learner/sessions',
      },
    ],
    upcomingWorkshops: [
      {
        id: 'uw1',
        title: 'CAT Quant Intensive',
        host: 'Priya Kumar',
        hostInitials: 'PK',
        date: 'Sat, 14 Jun · 11:00 AM',
        duration: 120,
        kind: 'workshop',
        href: '/learner/workshops',
        seatsLeft: 18,
      },
      {
        id: 'uw2',
        title: 'System Design Interview Bootcamp',
        host: 'Ritesh Mehta',
        hostInitials: 'RM',
        date: 'Sat, 28 Jun · 6:00 PM',
        duration: 120,
        kind: 'group',
        href: '/learner/workshops',
        seatsLeft: 3,
      },
    ],
    courses: continueLearning.slice(0, 3),
  }
}

export async function getLearnerCourses(): Promise<Course[]> {
  return mockCourses
}

export async function getLearnerExperts(): Promise<Creator[]> {
  return mockCreators
}

export async function getLearnerWorkshops(): Promise<{
  offers: Offer[]
  creators: Creator[]
}> {
  return { offers: mockOffers, creators: mockCreators }
}

export async function getLearnerResources(): Promise<{
  resources: Resource[]
  categories: typeof resourceCategories
  continueLearning: CourseProgress[]
}> {
  return { resources: mockResources, categories: resourceCategories, continueLearning }
}

export async function getLearnerNotes(): Promise<LearnerNote[]> {
  return mockNotes
}

export async function getLearnerBookmarks(): Promise<{
  resources: Resource[]
  experts: Creator[]
}> {
  return {
    resources: mockResources.filter((r) => r.bookmarked),
    experts: featuredCreators,
  }
}

export async function getLearnerDownloads(): Promise<Resource[]> {
  return mockResources.filter((r) => r.downloaded)
}
