import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { CQSRing } from '@/components/dashboard/creator/cqs-ring'
import { CQSSignalBar } from '@/components/dashboard/creator/cqs-signal-bar'
import { InsightBox } from '@/components/dashboard/creator/insight-box'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockCreators } from '@/data/mock-creators'

export const metadata = { title: 'CQS Score — Creonex' }

const signals = [
  { label: 'Rating average', key: 'rating' as const, display: (v: number) => `${(v / 100 * 5).toFixed(1)} / 5` },
  { label: 'Completion rate', key: 'completionRate' as const, display: (v: number) => `${v}%` },
  { label: 'Response time', key: 'responseScore' as const, display: (v: number) => `${v}/100` },
  { label: 'Rebooking rate', key: 'rebookingRate' as const, display: (v: number) => `${v}%` },
  { label: 'Profile quality', key: 'profileQuality' as const, display: (v: number) => `${v}/100` },
  { label: 'Recency', key: 'recencyScore' as const, display: (v: number) => `${v}/100` },
]

const cqsImpact = [
  { label: 'Search ranking', description: 'Higher CQS = shown first in discovery.' },
  { label: 'Featured eligibility', description: 'Score 90+ to be featured on the homepage.' },
  { label: '14-day boost', description: 'New sessions get a temporary visibility boost.' },
  { label: 'Trust badge', description: 'Verified (75+) and Elite (90+) badges on your profile.' },
]

export default function CQSPage(): React.ReactElement {
  const creator = mockCreators[0]
  const weakestSignal = signals.reduce((min, s) =>
    creator.signals[s.key] < creator.signals[min.key] ? s : min
  )

  return (
    <>
      <DashboardTopbar title="CQS Score" />
      <div className="p-6 space-y-6">

        <Card>
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <CQSRing score={creator.cqsScore} size={120} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground max-w-xs">
                Your Creator Quality Score is calculated from 6 signals updated in real-time.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Signal breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {signals.map((s, i) => (
              <CQSSignalBar
                key={s.key}
                label={s.label}
                value={creator.signals[s.key]}
                displayValue={s.display(creator.signals[s.key])}
                index={i}
              />
            ))}
          </CardContent>
        </Card>

        <InsightBox
          message={`Your weakest signal is "${weakestSignal.label}" at ${creator.signals[weakestSignal.key]}/100. Improving this will have the highest impact on your CQS.`}
          type="warning"
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">What CQS affects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cqsImpact.map((item) => (
              <div key={item.label} className="flex gap-3">
                <div className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
