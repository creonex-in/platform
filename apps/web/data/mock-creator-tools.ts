export interface PriorityDM {
  id: string
  name: string
  initials: string
  question: string
  amount: number
  date: string
  answered: boolean
}

export interface CreatorTestimonial {
  id: string
  name: string
  initials: string
  rating: number
  text: string
  date: string
  published: boolean
}

export const mockPriorityDMs: PriorityDM[] = []

export const mockCreatorTestimonials: CreatorTestimonial[] = [
  { id: 't1', name: 'Arjun Kumar', initials: 'AK', rating: 5, text: 'Meera’s feedback on my portfolio was incredibly specific and actionable. Booked again already.', date: 'May 28, 2025', published: true },
  { id: 't2', name: 'Preet Randhawa', initials: 'PR', rating: 5, text: 'Worth every rupee. Totally changed how I approach UX research.', date: 'May 20, 2025', published: true },
  { id: 't3', name: 'Sanya Rao', initials: 'SR', rating: 4, text: 'Great session. Would have loved more time on case study structure.', date: 'May 15, 2025', published: false },
]

export const analyticsSummary = {
  totalViews: 1240,
  viewsChange: 12,
  conversionRate: 3.1,
  conversionChange: 0.4,
  avgRating: 4.9,
  repeatRate: 72,
}

export const topOffers = [
  { title: 'UX Case Study Template Pack', bookings: 112, revenue: 22288 },
  { title: '1:1 UI/UX Portfolio Review', bookings: 38, revenue: 18962 },
  { title: 'UX Research Deep Dive', bookings: 24, revenue: 14376 },
]
