import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface SectionHeaderProps {
  icon: IconDefinition
  title: string
  description: string
  viewAllHref?: string
  viewAllLabel?: string
}

export function SectionHeader({
  icon,
  title,
  description,
  viewAllHref,
  viewAllLabel = 'View all',
}: SectionHeaderProps): React.ReactElement {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FontAwesomeIcon icon={icon} className="size-4" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-lg font-semibold sm:text-xl">{title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {viewAllLabel}
          <FontAwesomeIcon icon={faArrowRight} className="size-3" />
        </Link>
      )}
    </div>
  )
}
