'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLink,
  faCheck,
  faCopy,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ProfileLinkButtonProps {
  username: string
}

export function ProfileLinkButton({ username }: ProfileLinkButtonProps): React.ReactElement {
  const [copied, setCopied] = useState(false)
  const path = `/c/${username}`

  function copy(): void {
    const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path
    void navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Profile link copied')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-9 max-w-[150px] items-center gap-2 rounded-full border border-border bg-muted/40 pl-3 pr-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:max-w-[260px]"
      >
        <FontAwesomeIcon icon={faLink} className="size-3.5 shrink-0 text-primary" />
        <span className="truncate font-medium">
          creonex.in/c/{username}
        </span>
        <FontAwesomeIcon
          icon={faArrowUpRightFromSquare}
          className="size-3 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
        />
      </Link>
      <Button
        variant="outline"
        size="icon"
        className="size-9 shrink-0 rounded-full"
        onClick={copy}
        aria-label="Copy profile link"
      >
        <FontAwesomeIcon
          icon={copied ? faCheck : faCopy}
          className={cn('size-4', copied && 'text-primary')}
        />
      </Button>
    </div>
  )
}
