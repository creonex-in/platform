'use client'

import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { buttonVariants } from '@/components/ui/button'
import type { Creator } from '@/types/creator'
import { cn } from '@/lib/utils'
import CreatorCard from './creator-card'

const PAGE_SIZE = 8

interface CreatorWithImage extends Creator {
  imageUrl: string
}

interface Props {
  creators: CreatorWithImage[]
}

export default function CreatorGrid({ creators }: Props): React.ReactElement {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visible = creators.slice(0, visibleCount)
  const hasMore = visibleCount < creators.length

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence initial={false}>
          {visible.map((creator, index) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              index={index}
              pageSize={PAGE_SIZE}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      <div className="mt-12 flex flex-col items-center gap-3">
        {hasMore ? (
          <>
            <p className="text-xs text-muted-foreground">
              Showing{' '}
              <span className="font-medium text-foreground">{visibleCount}</span> of{' '}
              {creators.length} creators
            </p>
            <button
              onClick={() => setVisibleCount((n) => Math.min(n + PAGE_SIZE, creators.length))}
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'gap-2.5 px-8')}
            >
              Load More
              <FontAwesomeIcon icon={faChevronDown} className="size-3.5" />
            </button>
          </>
        ) : (
          creators.length > PAGE_SIZE && (
            <p className="text-xs text-muted-foreground">
              All{' '}
              <span className="font-medium text-foreground">{creators.length}</span> creators
              shown
            </p>
          )
        )}
      </div>
    </div>
  )
}
