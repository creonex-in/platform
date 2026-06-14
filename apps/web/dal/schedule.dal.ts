import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { scheduleService } from '@/services/schedule.service'
import { isUnauthorized, isNotFound } from '@/lib/api'
import type { Schedule } from '@/types/schedule'

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

export const getDefaultSchedule = cache(async (): Promise<Schedule | null> => {
  try {
    const cookieHeader = await getCookieHeader()
    const list = await scheduleService.getSchedules(cookieHeader)
    const target = list.find((s) => s.isDefault) ?? list[0] ?? null
    if (!target) return null
    // list endpoint omits rules/overrides — fetch full details
    return await scheduleService.getScheduleById(target.id, cookieHeader)
  } catch (e) {
    if (isUnauthorized(e) || isNotFound(e)) return null
    throw e
  }
})
