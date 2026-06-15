import 'server-only'
import { cookies } from 'next/headers'
import { payoutsService } from '@/services/payouts.service'
import type {
  KycStatusResponse, CreatorEarnings, LedgerEntryItem, PayoutItem,
} from '@creonex/types'

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

export async function getKycStatus(): Promise<KycStatusResponse> {
  return payoutsService.getKycStatus(await getCookieHeader())
}

export async function getEarnings(): Promise<CreatorEarnings> {
  return payoutsService.getEarnings(await getCookieHeader())
}

export async function getLedger(): Promise<LedgerEntryItem[]> {
  return payoutsService.getLedger(await getCookieHeader())
}

export async function getPayoutHistory(): Promise<PayoutItem[]> {
  return payoutsService.getPayoutHistory(await getCookieHeader())
}
