'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFilePdf,
  faPlay,
  faTableCells,
  faBook,
  faCode,
  faDownload,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'
import { faBookmark as faBookmarkOutline } from '@fortawesome/free-regular-svg-icons'
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Resource, ResourceType } from '@/types/resource'
import { toast } from 'sonner'

const typeIcon: Record<ResourceType, IconDefinition> = {
  pdf: faFilePdf,
  video: faPlay,
  template: faTableCells,
  guide: faBook,
  cheatsheet: faCode,
}

const typeLabel: Record<ResourceType, string> = {
  pdf: 'PDF',
  video: 'Video',
  template: 'Template',
  guide: 'Guide',
  cheatsheet: 'Cheatsheet',
}

interface ResourceRowProps {
  resource: Resource
  index?: number
}

export function ResourceRow({ resource, index = 0 }: ResourceRowProps): React.ReactElement {
  const [bookmarked, setBookmarked] = useState(resource.bookmarked)
  const [downloaded, setDownloaded] = useState(resource.downloaded)

  const meta =
    resource.type === 'video'
      ? `${resource.durationMin} min`
      : resource.sizeMB
        ? `${resource.sizeMB} MB`
        : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 6) * 0.04 }}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50 sm:gap-4 sm:p-4"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <FontAwesomeIcon icon={typeIcon[resource.type]} className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{resource.title}</p>
          <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal">
            {typeLabel[resource.type]}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {meta && <>{meta} · </>}By {resource.authorName}
        </p>
      </div>

      <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{resource.date}</span>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={downloaded ? 'Downloaded' : 'Download'}
          onClick={() => {
            if (!downloaded) {
              setDownloaded(true)
              toast.success(`Downloading “${resource.title}”`)
            }
          }}
        >
          <FontAwesomeIcon
            icon={downloaded ? faCheck : faDownload}
            className="size-3.5"
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          onClick={() => {
            setBookmarked((b) => !b)
            toast.success(bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks')
          }}
        >
          <FontAwesomeIcon
            icon={bookmarked ? faBookmarkSolid : faBookmarkOutline}
            className="size-3.5"
          />
        </Button>
      </div>
    </motion.div>
  )
}
