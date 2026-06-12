import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { userService } from '@/services/user.service'
import { isUnauthorized, isNotFound } from '@/lib/api'
import type { UserContext, CreatorProfile } from '@/types/api'

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

export async function getMe(): Promise<UserContext | null> {
  try {
    const cookieHeader = await getCookieHeader()
    return await userService.getMe(cookieHeader)
  } catch (e) {
    if (isUnauthorized(e)) return null
    throw e
  }
}

export interface CreatorContext {
  user: UserContext | null
  profile: CreatorProfile | null
  /** true when API returned 404 — creator role exists but onboarding never started */
  profileMissing: boolean
}

// cache() — layout and page share one fetch per request
export const getCreatorContext = cache(async (): Promise<CreatorContext> => {
  const cookieHeader = await getCookieHeader()
  if (!cookieHeader) return { user: null, profile: null, profileMissing: false }

  const [user, profileResult] = await Promise.all([
    userService.getMe(cookieHeader).catch(() => null),
    userService
      .getCreatorProfile(cookieHeader)
      .then((profile) => ({ profile, missing: false }))
      .catch((e: unknown) => ({ profile: null, missing: isNotFound(e) })),
  ])

  return { user, profile: profileResult.profile, profileMissing: profileResult.missing }
});
