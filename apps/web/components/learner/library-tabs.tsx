'use client'

import { useState } from 'react'
import Link from 'next/link'
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons'
import { buttonVariants } from '@/components/ui/button'
import { DigitalCard } from './digital-card'
import { SavedList } from './saved-list'
import { NotesPanel } from './notes-panel'
import { EmptyState } from './shared'
import { cn } from '@/lib/utils'
import type { LearnerBookingItem, LearnerNote, LearnerSavedItem } from '@creonex/types'

const TABS = [
  { value: 'purchases', label: 'Purchases' },
  { value: 'saved', label: 'Saved' },
  { value: 'notes', label: 'Notes' },
] as const
type Tab = (typeof TABS)[number]['value']

export function LibraryTabs({
  digital, saved, notes,
}: {
  digital: LearnerBookingItem[]
  saved: LearnerSavedItem[]
  notes: LearnerNote[]
}): React.ReactElement {
  const [tab, setTab] = useState<Tab>('purchases')

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-full border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              tab === t.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'purchases' &&
        (digital.length === 0 ? (
          <EmptyState
            icon={faBoxOpen}
            title="No purchases yet"
            description="Digital products you buy appear here to download anytime."
            action={<Link href="/explore" className={cn(buttonVariants({ size: 'sm' }), 'rounded-lg')}>Explore creators</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {digital.map((b) => <DigitalCard key={b.id} booking={b} />)}
          </div>
        ))}

      {tab === 'saved' && <SavedList initial={saved} />}
      {tab === 'notes' && <NotesPanel initial={notes} />}
    </div>
  )
}
