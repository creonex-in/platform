import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { AgendaCard } from '@/components/dashboard/learner/agenda-card'
import type { AgendaItem } from '@/types/learner'

interface UpcomingAgendaProps {
  items: AgendaItem[]
}

export function UpcomingAgenda({ items }: UpcomingAgendaProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={faCalendarDays}
        title="Nothing scheduled yet"
        description="Book a 1:1 session or register for a workshop to see it here."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <AgendaCard key={item.id} item={item} />
      ))}
    </div>
  )
}
