import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { SettingsPanel } from '@/components/dashboard/shared/settings-panel'

export const metadata = { title: 'Settings — Creonex' }

export default function LearnerSettingsPage(): React.ReactElement {
  return (
    <>
      <DashboardTopbar title="Settings" />
      <div className="p-6">
        <SettingsPanel
          role="learner"
          name="Arjun Kumar"
          initials="AK"
          email="arjun@example.in"
          notifications={[
            { id: 'session-reminders', label: 'Session reminders', description: 'Reminders before your upcoming sessions.', defaultOn: true },
            { id: 'live-alerts', label: 'Live alerts', description: 'When a saved creator goes live.', defaultOn: true },
            { id: 'workshops', label: 'New workshops', description: 'When creators you follow schedule workshops.', defaultOn: false },
            { id: 'promotions', label: 'Promotions', description: 'Offers and discounts from creators.', defaultOn: false },
          ]}
        />
      </div>
    </>
  )
}
