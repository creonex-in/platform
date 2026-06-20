'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faQuoteLeft, faLink, faCommentDots } from '@fortawesome/free-solid-svg-icons'
import { getInitials } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { testimonialsService } from '@/services/testimonials.service'
import type { CreatorTestimonialItem } from '@creonex/types'

interface TestimonialsClientProps {
  testimonials: CreatorTestimonialItem[]
  requestUrl: string | null
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function TestimonialsClient({ testimonials: initial, requestUrl }: TestimonialsClientProps): React.ReactElement {
  const [items, setItems] = useState<CreatorTestimonialItem[]>(initial)
  const publishedCount = items.filter((t) => t.isPublic).length

  async function handleToggle(id: string, newVal: boolean) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, isPublic: newVal } : x)))
    try {
      await testimonialsService.updateVisibility(id, newVal)
    } catch {
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, isPublic: !newVal } : x)))
      toast.error('Failed to update visibility')
    }
  }

  async function handleRequestLink() {
    if (!requestUrl) {
      toast.info('Complete your profile setup to get a shareable link')
      return
    }
    try {
      await navigator.clipboard.writeText(requestUrl)
      toast.success('Link copied!', 'Share it with learners to collect reviews')
    } catch {
      toast.error('Could not copy link', requestUrl)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
        <div>
          <p className="text-sm font-medium">{publishedCount} published on your profile</p>
          <p className="text-xs text-muted-foreground">
            Toggle which testimonials appear on your public page.
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={handleRequestLink}>
          <FontAwesomeIcon icon={faLink} className="mr-1.5 size-3" />
          Request testimonial
        </Button>
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <FontAwesomeIcon icon={faCommentDots} className="size-6 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No reviews yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Share your request link with learners after a session — they can leave a review directly from the link.
            </p>
          </div>
          <Button variant="outline" size="sm" className="text-xs mt-1" onClick={handleRequestLink}>
            <FontAwesomeIcon icon={faLink} className="mr-1.5 size-3" />
            Copy request link
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {items.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.04 }}
          >
            <Card className="h-full">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-muted text-xs font-medium">
                        {getInitials(t.learnerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{t.learnerName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t.learnerRole ? `${t.learnerRole} · ` : ''}{formatDate(t.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <FontAwesomeIcon key={s} icon={faStar} className="size-3" />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <FontAwesomeIcon
                    icon={faQuoteLeft}
                    className="mt-0.5 size-3 shrink-0 text-muted-foreground/50"
                  />
                  <p className="text-sm text-muted-foreground">{t.content}</p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {t.isPublic ? 'Visible on profile' : 'Hidden'}
                  </span>
                  <Switch
                    checked={t.isPublic}
                    onCheckedChange={(v) => handleToggle(t.id, v)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  )
}
