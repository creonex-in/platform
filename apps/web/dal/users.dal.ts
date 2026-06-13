import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { userService } from '@/services/user.service'
import { isUnauthorized, isNotFound } from '@/lib/api'
import type { UserContext, CreatorProfile } from '@creonex/types'

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

// cache() — deduplicates across layout + page in the same request
export const getMe = cache(async (): Promise<UserContext | null> => {
  try {
    const cookieHeader = await getCookieHeader()
    return await userService.getMe(cookieHeader)
  } catch (e) {
    if (isUnauthorized(e)) return null
    throw e
  }
})

export interface CreatorContext {
  user: UserContext | null
  profile: CreatorProfile | null
  /** true when API returned 404 — creator role exists but onboarding not started */
  profileMissing: boolean
}

export const getCreatorContext = cache(async (): Promise<CreatorContext> => {
  const cookieHeader = await getCookieHeader()

  const [user, profileResult] = await Promise.all([
    // cached getMe() — dedupes with requireAuth/requireCreator in the same request
    getMe(),
    userService
      .getCreatorProfile(cookieHeader)
      .then((profile) => ({ profile, missing: false }))
      .catch((e: unknown) => ({ profile: null, missing: isNotFound(e) })),
  ])

  return { user, profile: profileResult.profile, profileMissing: profileResult.missing }
})

/**
 * Whether the current learner still needs onboarding.
 * No profile yet (404) → needs onboarding. Auth/other errors → false (don't nag).
 */
export const needsLearnerOnboarding = cache(async (): Promise<boolean> => {
  try {
    const profile = await userService.getLearnerProfile(await getCookieHeader())
    return profile.onboardingStatus !== 'complete'
  } catch (e) {
    if (isNotFound(e)) return true
    return false
  }
})
