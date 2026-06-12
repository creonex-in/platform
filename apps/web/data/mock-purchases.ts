import type { Purchase } from '@/types/learner'

export const mockPurchases: Purchase[] = [
  { id: 'pu1', creatorName: 'Meera Venkatesh', creatorInitials: 'MV', offerTitle: '1:1 UI/UX Portfolio Review', offerType: 'one_on_one', purchasedAt: 'May 28, 2025', price: 499, completed: true, rated: true, rating: 5 },
  { id: 'pu2', creatorName: 'Rohit Sharma', creatorInitials: 'RS', offerTitle: 'DSA Interview Prep', offerType: 'one_on_one', purchasedAt: 'May 15, 2025', price: 699, completed: true, rated: false },
  { id: 'pu3', creatorName: 'Priya Kumar', creatorInitials: 'PK', offerTitle: 'CAT Quant Intensive', offerType: 'workshop', purchasedAt: 'May 5, 2025', price: 999, completed: false, rated: false },
  { id: 'pu4', creatorName: 'Nikhil Bhatia', creatorInitials: 'NB', offerTitle: 'Personal Finance Starter Pack', offerType: 'digital', purchasedAt: 'Apr 20, 2025', price: 199, completed: true, rated: true, rating: 4 },
]
