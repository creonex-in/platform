import type { Metadata } from 'next'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { CoursesView } from '@/components/dashboard/learner/courses-view'
import { getLearnerCourses } from '@/dal/learner.dal'

export const metadata: Metadata = { title: 'Courses — Creonex' }

export default async function CoursesPage(): Promise<React.ReactElement> {
  const courses = await getLearnerCourses()

  return (
    <>
      <DashboardTopbar title="Courses" showSearch />
      <CoursesView courses={courses} />
    </>
  )
}
