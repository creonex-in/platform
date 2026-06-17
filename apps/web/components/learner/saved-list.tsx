'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faUser } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { useSaved, useToggleSaved } from '@/hooks/use-learner'
import { toast } from '@/lib/toast'
import { EmptyState, Spinner } from './shared'
import type { LearnerSavedItem } from '@creonex/types'

export function SavedList({ initial }: { initial: LearnerSavedItem[] }): React.ReactElement {
  const { data = initial } = useSaved()
  const toggle = useToggleSaved()

  if (data.length === 0) {
    return (
      <EmptyState
        icon={faBookmark}
        title="Nothing saved yet"
        description="Bookmark creators and offerings to find them here."
      />
    )
  }

  async function remove(item: LearnerSavedItem): Promise<void> {
    try {
      await toggle.mutateAsync({
        saved: true,
        targetType: item.targetType as 'creator' | 'offering',
        targetId: item.targetId,
      })
    } catch {
      toast.error('Could not remove. Try again.')
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {data.map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-muted">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="44px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                <FontAwesomeIcon icon={faUser} className="size-4" />
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{item.title ?? 'Removed'}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">
              {item.subtitle ?? item.targetType}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {item.href && (
              <Button
                variant="outline" size="sm" className="h-8 rounded-lg"
                nativeButton={false} render={<Link href={item.href} />}
              >
                View
              </Button>
            )}
            <Button
              variant="ghost" size="sm"
              className="h-8 rounded-lg text-muted-foreground"
              onClick={() => remove(item)}
              disabled={toggle.isPending}
              aria-label="Remove"
            >
              {toggle.isPending ? <Spinner /> : <FontAwesomeIcon icon={faBookmark} className="size-3.5" />}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
