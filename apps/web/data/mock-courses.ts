import type { Course } from '@/types/course'

const img = (id: string): string =>
  `https://images.unsplash.com/${id}?w=600&q=80&auto=format&fit=crop`

export const mockCourses: Course[] = [
  { id: 'crs1', title: 'UI/UX Design from Scratch', image: img('photo-1561070791-2526d30994b5'), expertName: 'Meera Venkatesh', expertInitials: 'MV', niche: 'UI/UX Design', level: 'Beginner', price: 1499, lessons: 42, durationHours: 8, rating: 4.9, students: 1240, cqsScore: 91 },
  { id: 'crs2', title: 'CAT Quant Masterclass', image: img('photo-1509228468518-180dd4864904'), expertName: 'Priya Kumar', expertInitials: 'PK', niche: 'CAT Quant', level: 'Intermediate', price: 1999, lessons: 60, durationHours: 14, rating: 4.9, students: 2100, cqsScore: 94 },
  { id: 'crs3', title: 'DSA for FAANG Interviews', image: img('photo-1517180102446-f3ece451e9d8'), expertName: 'Rohit Sharma', expertInitials: 'RS', niche: 'DSA & Coding', level: 'Advanced', price: 2499, lessons: 85, durationHours: 22, rating: 4.7, students: 980, cqsScore: 85 },
  { id: 'crs4', title: 'Personal Finance Essentials', image: img('photo-1611974789855-9c2a0a7236a3'), expertName: 'Nikhil Bhatia', expertInitials: 'NB', niche: 'Personal Finance', level: 'Beginner', price: 799, lessons: 24, durationHours: 5, rating: 4.6, students: 3400, cqsScore: 82 },
  { id: 'crs5', title: 'System Design Deep Dive', image: img('photo-1558494949-ef010cbdcc31'), expertName: 'Ritesh Mehta', expertInitials: 'RM', niche: 'System Design', level: 'Advanced', price: 2999, lessons: 38, durationHours: 12, rating: 4.8, students: 640, cqsScore: 89 },
  { id: 'crs6', title: 'Verbal & DILR for CAT', image: img('photo-1456513080510-7bf3a84b82f8'), expertName: 'Aryan Joshi', expertInitials: 'AJ', niche: 'CAT Preparation', level: 'Intermediate', price: 1299, lessons: 36, durationHours: 9, rating: 4.8, students: 870, cqsScore: 88 },
]

export const topCourses = [...mockCourses].sort((a, b) => b.cqsScore - a.cqsScore)
