import type { Booking } from '@/types/booking'

export const mockBookings: Booking[] = [
  { id: 'b1', learnerName: 'Arjun Kumar', learnerInitials: 'AK', offerTitle: 'UI/UX Portfolio Review', offerType: 'one_on_one', date: 'Today', time: '6:00 PM', price: 499, status: 'upcoming', rated: false },
  { id: 'b2', learnerName: 'Sanya Rao', learnerInitials: 'SR', offerTitle: 'UI/UX Portfolio Review', offerType: 'one_on_one', date: 'Today', time: '8:00 PM', price: 499, status: 'confirmed', rated: false },
  { id: 'b3', learnerName: 'Ritesh M.', learnerInitials: 'RM', offerTitle: 'Figma Crash Course', offerType: 'workshop', date: 'Jun 8', time: '11:00 AM', price: 799, status: 'confirmed', rated: false },
  { id: 'b4', learnerName: 'Pooja Nair', learnerInitials: 'PN', offerTitle: 'UI/UX Portfolio Review', offerType: 'one_on_one', date: 'May 28', time: '5:00 PM', price: 499, status: 'completed', rated: true, rating: 5 },
  { id: 'b5', learnerName: 'Dev Malhotra', learnerInitials: 'DM', offerTitle: 'UI/UX Portfolio Review', offerType: 'one_on_one', date: 'May 25', time: '7:00 PM', price: 499, status: 'completed', rated: false },
  { id: 'b6', learnerName: 'Kavya Reddy', learnerInitials: 'KR', offerTitle: 'Figma Crash Course', offerType: 'workshop', date: 'May 20', time: '10:00 AM', price: 799, status: 'completed', rated: true, rating: 5 },
  { id: 'b7', learnerName: 'Harsh Agarwal', learnerInitials: 'HA', offerTitle: 'UX Research Deep Dive', offerType: 'group', date: 'May 15', time: '4:00 PM', price: 599, status: 'completed', rated: true, rating: 4 },
]
