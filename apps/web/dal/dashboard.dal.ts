import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { dashboardService } from '@/services/dashboard.service'
import { isUnauthorized } from '@/lib/api'
import type { CreatorDashboardSummary } from '@creonex/types'

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

export const getCreatorDashboardSummary = cache(async (): Promise<CreatorDashboardSummary | null> => {
  try {
    const tz = 'Asia/Kolkata'
    return await dashboardService.getSummary(tz, await getCookieHeader())
  } catch (e) {
    if (isUnauthorized(e)) return null
    throw e
  }
})
