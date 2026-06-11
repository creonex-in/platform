import type { Metadata } from 'next'
import { LearnerStep1Form } from '@/components/onboarding/learner/step-1-form'

export const metadata: Metadata = { title: 'Get Started — Creonex' }

export default function LearnerStep1Page(): React.ReactElement {
  return <LearnerStep1Form />
}
