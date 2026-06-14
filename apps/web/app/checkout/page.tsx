import { notFound } from 'next/navigation'
import { creatorsService } from '@/services/creators.service'
import { isNotFound } from '@/lib/api'
import { CheckoutClient } from './_components/checkout-client'
import type { PublicCreatorProfile } from '@creonex/types'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    creator?: string
    offering?: string
    start?: string
    end?: string
    tz?: string
  }>
}): Promise<React.ReactElement> {
  const { creator, offering: offeringId, start, end, tz } = await searchParams

  if (!creator || !offeringId || !start || !end) notFound()

  let profile: PublicCreatorProfile
  try {
    profile = await creatorsService.getPublicProfile(creator)
  } catch (e) {
    if (isNotFound(e)) notFound()
    throw e
  }

  const offering = profile.offerings.find((o) => o.id === offeringId)
  if (!offering) notFound()

  return (
    <CheckoutClient
      profile={profile}
      offering={offering}
      start={start}
      end={end}
      tz={tz ?? 'Asia/Kolkata'}
    />
  )
}
