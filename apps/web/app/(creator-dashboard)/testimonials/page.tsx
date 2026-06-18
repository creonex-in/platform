import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shared/dashboard-shell'
import { getCreatorContext } from '@/dal/users.dal'
import { getCreatorTestimonials } from '@/dal/testimonials.dal'
import { TestimonialsClient } from './_components/testimonials-client'
import { TestimonialsSkeleton } from './_components/testimonials-skeleton'

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3001'

async function TestimonialsContent(): Promise<React.ReactElement> {
  const [{ profile }, testimonials] = await Promise.all([
    getCreatorContext(),
    getCreatorTestimonials(),
  ])
  const requestUrl = profile?.username
    ? `${WEB_URL}/c/${profile.username}/testimonial`
    : null

  return <TestimonialsClient testimonials={testimonials} requestUrl={requestUrl} />
}

export default function TestimonialsPage(): React.ReactElement {
  return (
    <DashboardShell title="Testimonials">
      <Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialsContent />
      </Suspense>
    </DashboardShell>
  )
}
