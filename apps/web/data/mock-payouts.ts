import type { Payout } from '@/types/payout'

export const mockPayouts: Payout[] = [
  { id: 'p1', date: 'May 31, 2025', amount: 4800, type: 'weekly-auto', status: 'paid', transactionId: 'TXN8821049' },
  { id: 'p2', date: 'May 24, 2025', amount: 3950, type: 'weekly-auto', status: 'paid', transactionId: 'TXN8814320' },
  { id: 'p3', date: 'May 17, 2025', amount: 5200, type: 'weekly-auto', status: 'paid', transactionId: 'TXN8808711' },
  { id: 'p4', date: 'May 10, 2025', amount: 2800, type: 'weekly-auto', status: 'paid', transactionId: 'TXN8802190' },
  { id: 'p5', date: 'May 4, 2025', amount: 1500, type: 'manual', status: 'paid', transactionId: 'TXN8799034' },
  { id: 'p6', date: 'Jun 7, 2025', amount: 6200, type: 'weekly-auto', status: 'pending', transactionId: 'TXN8831000' },
]

export const payoutSummary = {
  pendingAmount: 6200,
  pendingRelease: 'Jun 7, 2025',
  totalEarned: 94800,
  thisMonth: 18400,
  platformFee: 10,
  kycVerified: false,
}
