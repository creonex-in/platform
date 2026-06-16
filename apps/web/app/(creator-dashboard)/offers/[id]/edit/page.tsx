import { notFound } from 'next/navigation'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { OfferForm } from '@/components/dashboard/creator/offer-form'
import { Card, CardContent } from '@/components/ui/card'
import { getOfferingById } from '@/dal/offerings.dal'
import { isNotFound } from '@/lib/api'
import type { CreatorOffering } from '@creonex/types'

export const metadata = { title: 'Edit Offer — Creonex' }

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.ReactElement> {
  const { id } = await params

  let offering: CreatorOffering
  try {
    offering = await getOfferingById(id)
  } catch (e) {
    if (isNotFound(e)) notFound()
    throw e
  }

  return (
    <>
      <DashboardTopbar title="Edit Offer" />
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <OfferForm offering={offering} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
