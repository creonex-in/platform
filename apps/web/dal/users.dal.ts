import 'server-only'
import { cookies } from 'next/headers'
import { userService } from '@/services/user.service'
import { isUnauthorized } from '@/lib/api'
import type { UserContext } from '@/types/api'

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
