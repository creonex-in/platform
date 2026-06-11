export interface Collaboration {
  id: string
  partnerName: string
  partnerInitials: string
  partnerNiche: string
  workshopTitle: string
  date: string
  mySplit: number
  partnerSplit: number
  registrations: number
  projectedRevenue: number
  status: 'active' | 'pending' | 'completed' | 'incoming'
}

export const mockCollaborations: Collaboration[] = [
  {
    id: 'col1',
    partnerName: 'Rohit Sharma',
    partnerInitials: 'RS',
    partnerNiche: 'DSA & Coding',
    workshopTitle: 'FAANG Prep: DSA + System Design',
    date: 'Jun 10, 2025',
    mySplit: 50,
    partnerSplit: 50,
    registrations: 48,
    projectedRevenue: 47952,
    status: 'active',
  },
  {
    id: 'col2',
    partnerName: 'Nikhil Bhatia',
    partnerInitials: 'NB',
    partnerNiche: 'Personal Finance',
    workshopTitle: 'Finance × Design Workshop',
    date: 'Jun 20, 2025',
    mySplit: 40,
    partnerSplit: 60,
    registrations: 0,
    projectedRevenue: 0,
    status: 'incoming',
  },
]
