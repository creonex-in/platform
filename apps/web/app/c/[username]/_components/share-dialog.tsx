'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShareNodes, faLink, faCheck } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp, faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ShareDialogProps {
  username: string
  displayName: string
}

export function ShareDialog({ username, displayName }: ShareDialogProps): React.ReactElement {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/c/${username}`
    : `https://creonex.in/c/${username}`

  const encodedUrl = encodeURIComponent(profileUrl)
  const encodedText = encodeURIComponent(`Check out ${displayName} on Creonex`)

  const shareLinks = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: faWhatsapp,
      color: 'bg-[#25D366] hover:bg-[#1fba59] text-white',
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      id: 'twitter',
      label: 'X / Twitter',
      icon: faXTwitter,
      color: 'bg-black hover:bg-zinc-800 text-white',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: faLinkedin,
      color: 'bg-[#0A66C2] hover:bg-[#0958a8] text-white',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* non-fatal */
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-sm"
        aria-label="Share profile"
      >
        <FontAwesomeIcon icon={faShareNodes} className="size-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">Share Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Profile link</p>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                <span className="flex-1 text-[12px] text-foreground font-medium truncate select-all">
                  {profileUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className={cn(
                    'shrink-0 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all',
                    copied
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faLink} className="size-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Share via</p>
              <div className="flex gap-2">
                {shareLinks.map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all',
                      s.color,
                    )}
                  >
                    <FontAwesomeIcon icon={s.icon} className="size-3.5" />
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
