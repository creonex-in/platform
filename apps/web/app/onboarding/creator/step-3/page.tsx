import type { Metadata } from 'next'
import { CreatorStep3Form } from '@/components/onboarding/creator/step-3-form'

export const metadata: Metadata = { title: 'Creator Onboarding — Creonex' }

export default function CreatorStep3Page(): React.ReactElement {
  return <CreatorStep3Form />
}
