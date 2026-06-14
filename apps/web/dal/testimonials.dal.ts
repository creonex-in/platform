import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { testimonialsService } from '@/services/testimonials.service'
import { isUnauthorized } from '@/lib/api'
import type { CreatorTestimonialItem } from '@creonex/types'

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

export const getCreatorTestimonials = cache(async (): Promise<CreatorTestimonialItem[]> => {
  try {
    return await testimonialsService.getCreatorTestimonials(await getCookieHeader())
  } catch (e) {
    if (isUnauthorized(e)) return []
    throw e
  }
})
