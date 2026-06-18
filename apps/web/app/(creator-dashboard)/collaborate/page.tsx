import { DashboardShell } from '@/components/dashboard/shared/dashboard-shell'
import { CollabCard } from '@/components/dashboard/creator/collab-card'
import { InsightBox } from '@/components/dashboard/creator/insight-box'
import { PageHeader } from '@/components/dashboard/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockCollaborations } from '@/data/mock-collab'

export const metadata = { title: 'Collaborate — Creonex' }

export default function CollaboratePage(): React.ReactElement {
  const incoming = mockCollaborations.filter((c) => c.status === 'incoming')
  const active = mockCollaborations.filter((c) => c.status === 'active' || c.status === 'pending')

  return (
    <DashboardShell
      title="Collaborate"
      action={<Button size="sm" className="h-8 text-xs">Invite creator</Button>}
    >
        <InsightBox
          message="Collaborating with complementary creators can 3x your reach and earnings. Propose a co-workshop to get started."
          type="info"
        />

        {incoming.length > 0 && (
          <div className="space-y-3">
            <PageHeader title="Invites" description="Creators who want to collaborate with you" />
            <div className="grid gap-3 sm:grid-cols-2">
              {incoming.map((c, i) => (
                <CollabCard key={c.id} collab={c} index={i} />
              ))}
            </div>
          </div>
        )}

        {active.length > 0 && (
          <div className="space-y-3">
            <PageHeader title="Active collaborations" />
            <div className="grid gap-3 sm:grid-cols-2">
              {active.map((c, i) => (
                <CollabCard key={c.id} collab={c} index={i} />
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">How collaborations work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              'Propose a co-hosted workshop or group session with another creator.',
              'Set a revenue split (e.g. 50/50). Both creators promote to their audiences.',
              'Creonex automatically splits earnings at payout time.',
              'Both creators get credit for the session in their CQS.',
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p>{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
    </DashboardShell>
  )
}
