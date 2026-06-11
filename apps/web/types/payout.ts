export interface Payout {
  id: string
  date: string
  amount: number
  type: 'weekly-auto' | 'manual'
  status: 'paid' | 'pending' | 'held'
  transactionId: string
}
