'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faUser, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSaved, useToggleSaved } from '@/hooks/use-learner'
import { toast } from '@/lib/toast'
import { EmptyState, Spinner } from './shared'
import type { LearnerSavedItem } from '@creonex/types'

export function SavedList({ initial }: { initial: LearnerSavedItem[] }): React.ReactElement {
  const { data = initial } = useSaved()
  const toggle = useToggleSaved()
  const [confirm, setConfirm] = useState<LearnerSavedItem | null>(null)

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
        <div
          key={item.id}
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.10)]"
        >
          {/* Image slot */}
          <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-muted">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="56px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                <FontAwesomeIcon icon={faUser} className="size-5" />
              </span>
            )}
          </span>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">
              {item.title ?? 'Removed'}
            </p>
            <p className="truncate text-sm capitalize text-muted-foreground">
              {item.subtitle ?? item.targetType}
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            {item.href && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl"
                nativeButton={false}
                render={<Link href={item.href} />}
              >
                <FontAwesomeIcon icon={faArrowRight} className="size-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl text-muted-foreground hover:text-destructive"
              onClick={() => setConfirm(item)}
              disabled={toggle.isPending}
              aria-label="Remove"
            >
              {toggle.isPending ? (
                <Spinner />
              ) : (
                <FontAwesomeIcon icon={faBookmark} className="size-3.5" />
              )}
            </Button>
          </div>
        </div>
      ))}

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from saved?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.title ? (
                <span className="font-medium text-foreground">{confirm.title}</span>
              ) : (
                'This item'
              )}{' '}
              will be removed from your bookmarks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirm) remove(confirm); setConfirm(null) }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
