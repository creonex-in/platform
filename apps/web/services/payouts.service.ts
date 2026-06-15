import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type {
  SubmitKycRequest,
  KycStatusResponse,
  CreatorEarnings,
  LedgerEntryItem,
  PayoutItem,
} from '@creonex/types'

export const payoutsService = {
  submitKyc: (body: SubmitKycRequest) =>
    api.post<KycStatusResponse>(endpoints.payouts.kyc, body),

  getKycStatus: (cookieHeader?: string) =>
    api.get<KycStatusResponse>(endpoints.payouts.kyc, { cookieHeader }),

  getEarnings: (cookieHeader?: string) =>
    api.get<CreatorEarnings>(endpoints.payouts.earnings, { cookieHeader }),

  getLedger: (cookieHeader?: string) =>
    api.get<LedgerEntryItem[]>(endpoints.payouts.ledger, { cookieHeader }),

  getPayoutHistory: (cookieHeader?: string) =>
    api.get<PayoutItem[]>(endpoints.payouts.history, { cookieHeader }),
}
