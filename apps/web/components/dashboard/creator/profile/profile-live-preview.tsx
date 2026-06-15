'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'

interface ProfileLivePreviewProps {
  /** Saved public handle to preview. Null until the profile has a username. */
  username: string | null
  /** Bump to force the iframe to reload after a save. */
  reloadKey: number
}

/**
 * Live mobile preview rendered in an iframe at phone width. Because the iframe has
 * its own viewport, the page's responsive (`sm:`/`md:`) breakpoints resolve to the
 * real MOBILE layout — exactly like a phone (share-as-icon, working tabs, etc.).
 * It loads the actual /c/<username> page in preview mode (`?preview=1`), so it
 * reflects the SAVED profile with booking interactions disabled; the `reloadKey`
 * reloads it after each save.
 */
export function ProfileLivePreview({ username, reloadKey }: ProfileLivePreviewProps): React.ReactElement {
  const url = username ? `/c/${username}` : null

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mobile preview</span>
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open your live page in a new tab"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            <span>Open live page</span>
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="size-3" />
          </a>
        )}
      </div>

      {/* Phone-width iframe = real mobile rendering of the actual page */}
      <div className="flex justify-center rounded-2xl border border-border/80 bg-muted/20 p-3 sm:p-4">
        {url ? (
          <iframe
            key={reloadKey}
            src={`${url}?preview=1`}
            title="Public profile mobile preview"
            loading="lazy"
            className="h-[72vh] max-h-[760px] w-full max-w-[390px] rounded-2xl border border-border bg-background shadow-sm"
          />
        ) : (
          <div className="flex h-[40vh] w-full max-w-[390px] items-center justify-center rounded-2xl border border-dashed border-border bg-background px-6 text-center text-sm text-muted-foreground">
            Save your profile to see the live preview.
          </div>
        )}
      </div>

      <p className="px-1 text-[11px] text-muted-foreground">
        Shows your saved public page on mobile. Save changes to refresh the preview.
      </p>
    </div>
  )
}
