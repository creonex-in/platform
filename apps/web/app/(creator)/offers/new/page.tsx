import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { OfferForm } from '@/components/dashboard/creator/offer-form'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = { title: 'New Offer — Creonex' }

export default function NewOfferPage(): React.ReactElement {
  return (
    <>
      <DashboardTopbar title="Create Offer" />
      <div className="p-6 max-w-5xl mx-auto">
        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <OfferForm />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
