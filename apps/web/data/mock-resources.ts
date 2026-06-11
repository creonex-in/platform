import type { Resource, CourseProgress, LearnerNote } from '@/types/resource'

export const mockResources: Resource[] = [
  { id: 'r1', title: 'UI Design Principles Guide', type: 'pdf', authorName: 'Meera Venkatesh', authorInitials: 'MV', date: 'May 12, 2025', sizeMB: 2.4, downloaded: true, bookmarked: true },
  { id: 'r2', title: 'Advanced Figma Techniques', type: 'video', authorName: 'Meera Venkatesh', authorInitials: 'MV', date: 'May 10, 2025', durationMin: 24, downloaded: false, bookmarked: false },
  { id: 'r3', title: 'Design System Template', type: 'template', authorName: 'Meera Venkatesh', authorInitials: 'MV', date: 'May 08, 2025', sizeMB: 5.6, downloaded: true, bookmarked: false },
  { id: 'r4', title: 'Wireframing Best Practices', type: 'pdf', authorName: 'Meera Venkatesh', authorInitials: 'MV', date: 'May 05, 2025', sizeMB: 1.8, downloaded: false, bookmarked: true },
  { id: 'r5', title: 'CAT Quant Formula Sheet', type: 'cheatsheet', authorName: 'Priya Kumar', authorInitials: 'PK', date: 'May 03, 2025', sizeMB: 0.9, downloaded: true, bookmarked: true },
  { id: 'r6', title: 'DSA Patterns Cheatsheet', type: 'cheatsheet', authorName: 'Rohit Sharma', authorInitials: 'RS', date: 'Apr 28, 2025', sizeMB: 1.2, downloaded: false, bookmarked: false },
  { id: 'r7', title: 'System Design Primer', type: 'guide', authorName: 'Ritesh Mehta', authorInitials: 'RM', date: 'Apr 22, 2025', sizeMB: 4.1, downloaded: true, bookmarked: false },
  { id: 'r8', title: 'SIP Planning Walkthrough', type: 'video', authorName: 'Nikhil Bhatia', authorInitials: 'NB', date: 'Apr 18, 2025', durationMin: 18, downloaded: false, bookmarked: true },
]

export const resourceCategories: { type: Resource['type']; label: string }[] = [
  { type: 'guide', label: 'Guides' },
  { type: 'video', label: 'Videos' },
  { type: 'pdf', label: 'PDFs' },
  { type: 'template', label: 'Templates' },
  { type: 'cheatsheet', label: 'Cheatsheets' },
]

export const continueLearning: CourseProgress[] = [
  {
    id: 'cl1',
    title: 'UI/UX Fundamentals',
    expertName: 'Meera Venkatesh',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80&auto=format&fit=crop',
    progress: 65,
    nextLesson: 'Layout & Composition',
    nextLessonDuration: '12 min',
  },
  {
    id: 'cl2',
    title: 'CAT Quant Masterclass',
    expertName: 'Priya Kumar',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80&auto=format&fit=crop',
    progress: 32,
    nextLesson: 'Number Systems',
    nextLessonDuration: '18 min',
  },
]

export const mockNotes: LearnerNote[] = [
  { id: 'n1', title: 'Spacing scale takeaways', course: 'UI/UX Fundamentals', snippet: 'Use a 4px base unit. 8/12/16/24 for most gaps. Avoid odd values.', date: 'May 11, 2025' },
  { id: 'n2', title: 'Auto-layout shortcuts', course: 'UI/UX Fundamentals', snippet: 'Shift+A wraps in auto-layout. Use fill vs hug intentionally.', date: 'May 09, 2025' },
  { id: 'n3', title: 'Quant: time-speed tricks', course: 'CAT Quant Masterclass', snippet: 'Convert to fractions early. Memorise common ratios for speed.', date: 'May 04, 2025' },
]
