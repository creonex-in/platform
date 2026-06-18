import 'server-only'
import { cookies } from 'next/headers'
import { learnerService } from '@/services/learner.service'
import { exploreService, type BrowseParams } from '@/services/explore.service'
import { isNotFound } from '@/lib/api'
import type {
  LearnerBookingItem,
  LearnerNote,
  LearnerOverview,
  LearnerProfile,
  LearnerSavedItem,
  BrowseOfferingsResponse,
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
        digitalCount: 0,
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

export async function getPublicOfferings(params: BrowseParams): Promise<BrowseOfferingsResponse> {
  try {
    return await exploreService.browse(params)
  } catch (e) {
    if (isNotFound(e)) {
      return { items: [], total: 0, limit: 0, offset: 0 }
    }
    throw e
  }
}

