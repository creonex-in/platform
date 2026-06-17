import 'server-only'
import { cookies } from 'next/headers'
import { learnerService } from '@/services/learner.service'
import { isNotFound } from '@/lib/api'
import type {
  LearnerBookingItem,
  LearnerGoal,
  LearnerNote,
  LearnerOverview,
  LearnerProfile,
  LearnerSavedItem,
} from '@creonex/types'

async function cookieHeader(): Promise<string> {
  return (await cookies()).toString()
}

export async function getLearnerOverview(): Promise<LearnerOverview> {
  try {
    return await learnerService.getOverview(await cookieHeader())
  } catch (e) {
    if (isNotFound(e)) {
      return {
        nextSession: null,
        upcomingCount: 0,
        recentDigital: [],
        activeGoals: [],
        savedCount: 0,
      }
    }
    throw e
  }
}

export async function getLearnerBookings(): Promise<LearnerBookingItem[]> {
  try {
    return await learnerService.getMyBookings(await cookieHeader())
  } catch (e) {
    if (isNotFound(e)) return []
    throw e
  }
}

export async function getLearnerSaved(): Promise<LearnerSavedItem[]> {
  try {
    return await learnerService.getSaved(await cookieHeader())
  } catch (e) {
    if (isNotFound(e)) return []
    throw e
  }
}

export async function getLearnerNotes(): Promise<LearnerNote[]> {
  try {
    return await learnerService.getNotes(await cookieHeader())
  } catch (e) {
    if (isNotFound(e)) return []
    throw e
  }
}

export async function getLearnerGoals(): Promise<LearnerGoal[]> {
  try {
    return await learnerService.getGoals(await cookieHeader())
  } catch (e) {
    if (isNotFound(e)) return []
    throw e
  }
}

export async function getLearnerProfile(): Promise<LearnerProfile> {
  try {
    return await learnerService.getProfile(await cookieHeader())
  } catch (e) {
    if (isNotFound(e)) {
      return {
        id: '',
        userId: '',
        goalType: null,
        interestedNiches: [],
        onboardingStatus: 'not_started',
      }
    }
    throw e
  }
}
