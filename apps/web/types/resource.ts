export type ResourceType = 'pdf' | 'video' | 'template' | 'guide' | 'cheatsheet'

export interface Resource {
  id: string
  title: string
  type: ResourceType
  authorName: string
  authorInitials: string
  date: string
  sizeMB?: number
  durationMin?: number
  downloaded: boolean
  bookmarked: boolean
}

export interface CourseProgress {
  id: string
  title: string
  expertName: string
  image: string
  progress: number
  nextLesson: string
  nextLessonDuration: string
}

export interface LearnerNote {
  id: string
  title: string
  course: string
  snippet: string
  date: string
}
