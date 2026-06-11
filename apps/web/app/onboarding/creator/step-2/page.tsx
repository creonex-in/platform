import type { Metadata } from 'next'
import { CreatorStep2Form } from '@/components/onboarding/creator/step-2-form'

export const metadata: Metadata = { title: 'Creator Onboarding — Creonex' }

export default function CreatorStep2Page(): React.ReactElement {
  return <CreatorStep2Form />
}
