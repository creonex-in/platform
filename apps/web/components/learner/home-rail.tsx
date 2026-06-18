'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar, faCalendarPlus, faFileLines, faLock,
  faVideo, faDownload, faFilePdf, faArrowRight
} from '@fortawesome/free-solid-svg-icons'
import { learnerService } from '@/services/learner.service'
import { isApiError } from '@/lib/api'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import type { LearnerBookingItem } from '@creonex/types'

function formatSidebarDateTime(iso: string | null): string {
  if (!iso) return 'No date set'
  const d = new Date(iso)
  
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
  const day = d.getDate()
  const year = d.getFullYear()
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  
  const dateStr = `${weekday}, ${day}, ${year}, ${month}`
  
  const startHour = d.getHours()
  const startMin = d.getMinutes()
  const ampmStart = startHour >= 12 ? 'pm' : 'am'
  const startHour12 = startHour % 12 || 12
  const startMinStr = startMin ? `:${startMin.toString().padStart(2, '0')}` : ''
  const startTimeStr = `${startHour12}${startMinStr} ${ampmStart}`
  
  const dEnd = new Date(d.getTime() + 2 * 3600000) // Default 2 hours duration matching screenshot
  const endHour = dEnd.getHours()
  const endMin = dEnd.getMinutes()
  const ampmEnd = endHour >= 12 ? 'pm' : 'am'
  const endHour12 = endHour % 12 || 12
  const endMinStr = endMin ? `:${endMin.toString().padStart(2, '0')}` : ''
  const endTimeStr = `${endHour12}${endMinStr}${ampmEnd}`
  
  return `${dateStr}\n${startTimeStr} - ${endTimeStr}`
}

export function HomeRail({
  upcoming,
  digital,
  past,
}: {
  upcoming: LearnerBookingItem[]
  digital: LearnerBookingItem[]
  past: LearnerBookingItem[]
}): React.ReactElement {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  async function download(b: LearnerBookingItem): Promise<void> {
    setDownloadingId(b.id)
    try {
      const a = await learnerService.getDigitalAccess(b.id)
      const url = a.externalUrl ?? a.files?.[0]?.url
      if (!url) {
        toast.error('No download available yet')
        return
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not download.')
    } finally {
      setDownloadingId(null)
    }
  }

  const upcomingSessions = upcoming.filter((b) => b.offeringType === 'one_on_one')

  return (
    <div className="space-y-6">
      {/* Grid for side-by-side layout of Upcoming Sessions and Digital Vault */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Upcoming 1:1 Sessions */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">
              Upcoming 1:1 Sessions
            </h3>
            {upcomingSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-6 px-4 space-y-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FontAwesomeIcon icon={faCalendar} className="size-5" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground">
                  No sessions yet — explore mentors
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                >
                  Explore Mentors
                  <FontAwesomeIcon icon={faArrowRight} className="size-2.5" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {upcomingSessions.slice(0, 3).map((b, i) => (
                  <motion.li
                    key={b.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between gap-4 pb-3 border-b border-border/50 last:pb-0 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground whitespace-pre-line leading-relaxed">
                        {formatSidebarDateTime(b.startTime)}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Add to calendar"
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <FontAwesomeIcon icon={faCalendar} className="size-4" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 2. My Digital Vault */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">
            My Digital Vault
          </h3>
          {digital.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-6 px-4 space-y-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FontAwesomeIcon icon={faFileLines} className="size-5" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                Nothing purchased yet
              </p>
              <Link
                href="/explore?type=digital"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                Browse Products
                <FontAwesomeIcon icon={faArrowRight} className="size-2.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => {
                const b = digital[i]
                const isReal = !!b
                const isDownloading = b ? downloadingId === b.id : false

                // Style matching for specific index from user screenshot:
                // Index 0: Blue download style
                // Index 1: Emerald (teal/green) download style
                // Index 2: Rose (red) PDF style
                // Index 3: White/gray PDF style
                // Index 4: White/gray PDF style
                // Index 5: Rose (red) PDF style
                let tileStyle = ""
                let icon = faFilePdf
                let label = "PDF"
                let showDownloadArrow = false
                let iconColor = ""

                if (i === 0) {
                  tileStyle = "text-blue-500 bg-blue-500/10 border-blue-500/20"
                  icon = faFileLines
                  label = "Download"
                  showDownloadArrow = true
                  iconColor = "#3b82f6"
                } else if (i === 1) {
                  tileStyle = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                  icon = faFileLines
                  label = "Download"
                  showDownloadArrow = true
                  iconColor = "#10b981"
                } else if (i === 2 || i === 5) {
                  tileStyle = "text-rose-500 bg-rose-500/10 border-rose-500/20"
                  icon = faFilePdf
                  label = "PDF"
                } else {
                  tileStyle = "text-muted-foreground bg-muted/20 border-border/50"
                  icon = faFilePdf
                  label = "PDF"
                }

                return (
                  <button
                    key={b?.id ?? `mock-${i}`}
                    type="button"
                    onClick={() => b && download(b)}
                    disabled={!isReal || isDownloading}
                    title={b?.offeringTitle ?? "Vault Slot"}
                    className={cn(
                      "group relative flex aspect-square flex-col items-center justify-center rounded-xl border p-2 text-center transition-all",
                      isReal ? "hover:scale-102 hover:border-foreground/30 cursor-pointer" : "opacity-40 cursor-not-allowed",
                      tileStyle
                    )}
                  >
                    {showDownloadArrow ? (
                      <div className="flex flex-col items-center justify-center">
                        <FontAwesomeIcon icon={icon} className="size-6 mb-1" style={{ color: iconColor }} />
                        <FontAwesomeIcon icon={faDownload} className="size-3 text-foreground" />
                      </div>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={icon} className="size-6 mb-1.5" />
                        <span className="text-[10px] font-bold tracking-wider uppercase text-foreground truncate w-full">
                          {label}
                        </span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Past Bookings */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          PAST BOOKINGS / WATCHLIST
        </h3>
        {past.length === 0 ? (
          <div className="text-center py-4 text-xs font-semibold text-muted-foreground">
            No past bookings or waitlist items found.
          </div>
        ) : (
          <div className="space-y-2.5">
            {past.slice(0, 3).map((b, i) => (
              <div
                key={b.id}
                className="flex items-center justify-between text-xs text-muted-foreground font-semibold py-1 border-b border-border/30 last:border-b-0"
              >
                <span className="truncate max-w-[250px]">{b.offeringTitle.toUpperCase()}</span>
                <span>{b.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
