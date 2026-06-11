'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faQuoteLeft } from '@fortawesome/free-solid-svg-icons'
import { mockCreatorTestimonials, type CreatorTestimonial } from '@/data/mock-creator-tools'
import { toast } from 'sonner'

export default function TestimonialsPage(): React.ReactElement {
  const [items, setItems] = useState<CreatorTestimonial[]>(mockCreatorTestimonials)
  const publishedCount = items.filter((t) => t.published).length

  return (
    <>
      <DashboardTopbar
        title="Testimonials"
        action={
          <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success('Share link copied')}>
            Request testimonial
          </Button>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium">{publishedCount} published on your profile</p>
          <p className="text-xs text-muted-foreground">
            Toggle which testimonials appear on your public page.
          </p>
        </div>

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
                          {t.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-[11px] text-muted-foreground">{t.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: t.rating }).map((_, s) => (
                        <FontAwesomeIcon key={s} icon={faStar} className="size-3" />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <FontAwesomeIcon icon={faQuoteLeft} className="mt-0.5 size-3 shrink-0 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t.text}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">
                      {t.published ? 'Visible on profile' : 'Hidden'}
                    </span>
                    <Switch
                      checked={t.published}
                      onCheckedChange={(v) => {
                        setItems((prev) =>
                          prev.map((x) => (x.id === t.id ? { ...x, published: v } : x))
                        )
                        toast.success(v ? 'Published to profile' : 'Hidden from profile')
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}
