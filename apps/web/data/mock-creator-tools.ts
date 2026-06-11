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

export interface AutoDMRule {
  id: string
  trigger: string
  message: string
  active: boolean
}

export interface DaySchedule {
  day: string
  enabled: boolean
  start: string
  end: string
}

export const mockPriorityDMs: PriorityDM[] = [
  { id: 'dm1', name: 'Ankit Verma', initials: 'AV', question: 'Can you review my portfolio before I apply to product design roles?', amount: 199, date: 'Today', answered: false },
  { id: 'dm2', name: 'Sneha Patil', initials: 'SP', question: 'What roadmap do you suggest to switch from graphic to UX design?', amount: 199, date: 'Yesterday', answered: false },
  { id: 'dm3', name: 'Karan Gupta', initials: 'KG', question: 'How do I price freelance UI projects in India?', amount: 299, date: 'May 28', answered: true },
]

export const mockCreatorTestimonials: CreatorTestimonial[] = [
  { id: 't1', name: 'Arjun Kumar', initials: 'AK', rating: 5, text: 'Meera’s feedback on my portfolio was incredibly specific and actionable. Booked again already.', date: 'May 28, 2025', published: true },
  { id: 't2', name: 'Preet Randhawa', initials: 'PR', rating: 5, text: 'Worth every rupee. Totally changed how I approach UX research.', date: 'May 20, 2025', published: true },
  { id: 't3', name: 'Sanya Rao', initials: 'SR', rating: 4, text: 'Great session. Would have loved more time on case study structure.', date: 'May 15, 2025', published: false },
]

export const mockAutoDMRules: AutoDMRule[] = [
  { id: 'a1', trigger: 'New follower', message: 'Thanks for following! Check out my 1:1 sessions to level up your design career.', active: true },
  { id: 'a2', trigger: 'Comment “GUIDE”', message: 'Here’s the free UX starter guide you asked for 👉 [link]', active: false },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const defaultSchedule: DaySchedule[] = DAYS.map((day, i) => ({
  day,
  enabled: i < 5,
  start: '9:00 AM',
  end: '6:00 PM',
}))

export const timeSlots: string[] = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
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
