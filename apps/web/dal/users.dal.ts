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
    userService.getMe(cookieHeader).catch(() => null),
    userService
      .getCreatorProfile(cookieHeader)
      .then((profile) => ({ profile, missing: false }))
      .catch((e: unknown) => ({ profile: null, missing: isNotFound(e) })),
  ])

  return { user, profile: profileResult.profile, profileMissing: profileResult.missing }
})
