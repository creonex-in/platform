import type { Metadata } from 'next'
import { CreatorStep1Form } from '@/components/onboarding/creator/step-1-form'

export const metadata: Metadata = { title: 'Creator Onboarding — Creonex' }

export default function CreatorStep1Page(): React.ReactElement {
  return <CreatorStep1Form defaultName="" />
}
