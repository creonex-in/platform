export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Course {
  id: string
  title: string
  image: string
  expertName: string
  expertInitials: string
  niche: string
  level: CourseLevel
  price: number
  lessons: number
  durationHours: number
  rating: number
  students: number
  cqsScore: number
}
