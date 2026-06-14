import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { OfferForm } from '@/components/dashboard/creator/offer-form'
import { Card, CardContent } from '@/components/ui/card'
import { getOfferingEligibility } from '@/dal/offerings.dal'

export const metadata = { title: 'New Offer — Creonex' }

export default async function NewOfferPage(): Promise<React.ReactElement> {
  const eligibility = await getOfferingEligibility()

  return (
    <>
      <DashboardTopbar title="Create Offer" />
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <OfferForm eligibility={eligibility} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
