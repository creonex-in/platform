import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { payoutsService } from '@/services/payouts.service'
import type {
  KycStatusResponse, CreatorEarnings, LedgerEntryItem, PayoutItem,
} from '@creonex/types'

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

// cache() — dedupes within a single request render.
export const getKycStatus = cache(async (): Promise<KycStatusResponse> => {
  return payoutsService.getKycStatus(await getCookieHeader())
})

export const getEarnings = cache(async (): Promise<CreatorEarnings> => {
  return payoutsService.getEarnings(await getCookieHeader())
})

export const getLedger = cache(async (): Promise<LedgerEntryItem[]> => {
  return payoutsService.getLedger(await getCookieHeader())
})

export const getPayoutHistory = cache(async (): Promise<PayoutItem[]> => {
  return payoutsService.getPayoutHistory(await getCookieHeader())
})
