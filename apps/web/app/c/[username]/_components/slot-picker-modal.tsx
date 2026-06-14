'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faXmark, faClock, faIndianRupeeSign, faArrowRight,
  faChevronLeft, faChevronRight, faCircleCheck, faShieldHalved,
  faVideo, faSun, faMugHot, faCalendarDay, faGlobe, faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { slotsService } from '@/services/slots.service'
import { getInitials } from '@/lib/utils'
import type { PublicOffering, PublicCreatorProfile } from '@creonex/types'
import type { SlotItem } from '@/services/slots.service'

interface SlotsByDate {
  [date: string]: SlotItem[]
}

interface Props {
  offering: PublicOffering
  profile: PublicCreatorProfile
  onClose: () => void
}

export function SlotPickerModal({ offering, profile, onClose }: Props) {
  const router = useRouter()

  const [slotsByDate, setSlotsByDate] = useState<SlotsByDate>({})
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null)
  const [tz, setTz] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [navigating, setNavigating] = useState(false)
  const dateStripRef = useRef<HTMLDivElement>(null)

  const isVerified = profile.qualityTier === 'verified' || profile.qualityTier === 'featured'

  // ── Fetch slots ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const today = new Date()
    const from = today.toISOString().slice(0, 10)
    const toDate = new Date(today)
    toDate.setDate(today.getDate() + 28)
    const to = toDate.toISOString().slice(0, 10)

    setSlotsLoading(true)
    setSelectedSlot(null)
    slotsService.getSlots(offering.id, tz, from, to)
      .then((slots) => {
        const grouped: SlotsByDate = {}
        for (const slot of slots) {
          // Group by the LOCAL date (in the selected tz), read straight from startLocal.
          const key = slot.startLocal.slice(0, 10)
          if (!grouped[key]) grouped[key] = []
          grouped[key].push(slot)
        }
        const dates = Object.keys(grouped).sort()
        setSlotsByDate(grouped)
        setAvailableDates(dates)
        setSelectedDate(dates.length > 0 ? dates[0] : null)
      })
      .catch(() => {})
      .finally(() => setSlotsLoading(false))
  }, [offering.id, tz])

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
    }
  }

  // startLocal is already wall-clock in the selected tz ("YYYY-MM-DDTHH:mm:ss±zz:zz").
  // Read it as a string so display stays correct for ANY chosen tz (not the browser's).
  const localHour = (isoLocal: string) => Number(isoLocal.slice(11, 13))
  const formatSlotTime = (isoLocal: string) => {
    const h = localHour(isoLocal)
    const m = isoLocal.slice(14, 16)
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h % 12 || 12}:${m} ${ampm}`
  }

  const slotsForDate = selectedDate ? (slotsByDate[selectedDate] ?? []) : []
  const amSlots = slotsForDate.filter((s) => localHour(s.startLocal) < 12)
  const pmSlots = slotsForDate.filter((s) => localHour(s.startLocal) >= 12)

  const scrollDates = (dir: -1 | 1) =>
    dateStripRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' })

  const goCheckout = () => {
    if (!selectedSlot) return
    setNavigating(true)
    const qs = new URLSearchParams({
      creator: profile.username,
      offering: offering.id,
      start: selectedSlot.start,
      end: selectedSlot.end,
      tz,
    }).toString()
    router.push(`/checkout?${qs}`)
  }

  // ── Left info panel ─────────────────────────────────────────────────────────────
  const leftPanel = (
    <aside className="relative shrink-0 overflow-hidden border-b md:border-b-0 md:border-r border-border/60 md:col-span-2 bg-linear-to-br from-primary/12 via-card to-card">
      {/* decorative glows */}
      <div className="pointer-events-none absolute -top-20 -right-12 size-52 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-16 size-44 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 p-6 md:p-8 h-full">
        {/* Creator */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="size-16 md:size-20 rounded-2xl overflow-hidden bg-primary/10 ring-2 ring-card shadow-lg">
              {profile.profilePhotoUrl ? (
                <Image src={profile.profilePhotoUrl} alt={profile.displayName ?? ''} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-extrabold text-2xl">
                  {getInitials(profile.displayName ?? profile.username)}
                </div>
              )}
            </div>
            {isVerified && (
              <span className="absolute -bottom-1.5 -right-1.5 size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-2 ring-card">
                <FontAwesomeIcon icon={faCircleCheck} className="size-3.5" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Session with</p>
            <p className="text-lg md:text-xl font-bold text-foreground leading-tight font-display truncate">
              {profile.displayName ?? `@${profile.username}`}
            </p>
            <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
          </div>
        </div>

        <div className="hidden md:block border-t border-border/50" />

        {/* Offering */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl md:text-2xl font-bold text-foreground leading-snug font-display">{offering.title}</h3>
          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-foreground bg-card border border-border rounded-xl px-3.5 py-2 shadow-sm">
              <FontAwesomeIcon icon={faIndianRupeeSign} className="size-3 text-primary" />
              {offering.price.toLocaleString('en-IN')}
            </span>
            {offering.durationMinutes && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground bg-card border border-border rounded-xl px-3.5 py-2 shadow-sm">
                <FontAwesomeIcon icon={faClock} className="size-3 text-primary" />
                {offering.durationMinutes} min
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground bg-card border border-border rounded-xl px-3.5 py-2 shadow-sm">
              <FontAwesomeIcon icon={faVideo} className="size-3 text-primary" />
              Google Meet
            </span>
          </div>

          {offering.description && (
            <p className="hidden md:block text-sm text-muted-foreground leading-relaxed line-clamp-6 mt-1">
              {offering.description}
            </p>
          )}
        </div>

        {/* Selected slot preview */}
        {selectedSlot && selectedDate && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faCalendarDay} className="size-4.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-foreground leading-tight">
                {formatSlotTime(selectedSlot.startLocal)}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {(() => { const f = formatDate(selectedDate); return `${f.day}, ${f.date} ${f.month}` })()}
              </p>
            </div>
          </div>
        )}

        {/* Trust footer */}
        <div className="hidden md:flex mt-auto pt-5 border-t border-border/40 items-center gap-2 text-muted-foreground">
          <FontAwesomeIcon icon={faShieldHalved} className="size-4 text-primary/70" />
          <p className="text-xs font-medium">Secure booking · Free reschedule up to 24h before</p>
        </div>
      </div>
    </aside>
  )

  // ── Right selection panel ────────────────────────────────────────────────────────
  const rightPanel = (
    <section className="md:col-span-3 flex flex-1 md:flex-none flex-col min-h-0">
      {/* Fixed header: heading + timezone + date strip */}
      <div className="shrink-0 p-6 md:p-8 pb-4 flex flex-col gap-5 border-b border-border/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">When should we meet?</h2>
            <p className="text-sm text-muted-foreground mt-1">Pick a date and time that works for you.</p>
          </div>
          <TimezoneSelect value={tz} onChange={setTz} />
        </div>

        {!slotsLoading && availableDates.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollDates(-1)}
              className="hidden sm:flex size-8 rounded-full border border-border items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all shrink-0"
              aria-label="Earlier dates"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="size-2.5" />
            </button>

            <div
              ref={dateStripRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory flex-1 py-1 [touch-action:pan-x]"
            >
              {availableDates.map((d) => {
                const f = formatDate(d)
                const active = d === selectedDate
                const count = slotsByDate[d]?.length ?? 0
                return (
                  <button
                    key={d}
                    onClick={() => { setSelectedDate(d); setSelectedSlot(null) }}
                    className={`relative flex flex-col items-center justify-center shrink-0 w-13 snap-start rounded-xl py-2.5 px-1 border text-center transition-all ${
                      active
                        ? 'bg-linear-to-b from-primary to-primary/85 text-primary-foreground border-primary shadow-md shadow-primary/25'
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    }`}
                  >
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${active ? 'opacity-90' : 'text-muted-foreground'}`}>{f.day}</span>
                    <span className="text-lg font-extrabold leading-none mt-1">{f.date}</span>
                    <span className={`text-[9px] font-medium mt-1 ${active ? 'opacity-90' : 'text-muted-foreground'}`}>{f.month}</span>
                    {!active && count > 0 && (
                      <span className="absolute top-1.5 right-1.5 size-1 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => scrollDates(1)}
              className="hidden sm:flex size-8 rounded-full border border-border items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all shrink-0"
              aria-label="Later dates"
            >
              <FontAwesomeIcon icon={faChevronRight} className="size-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* Scroll area: ONLY the time slots */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 md:p-8 pt-5">
          {slotsLoading ? (
            <div className="flex flex-col items-center justify-center min-h-64 gap-3 text-muted-foreground">
              <span className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm">Loading availability…</span>
            </div>
          ) : availableDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-64 gap-2 text-center">
              <FontAwesomeIcon icon={faClock} className="size-8 text-muted-foreground/40" />
              <p className="text-base font-semibold text-foreground">No availability right now</p>
              <p className="text-sm text-muted-foreground max-w-xs">Try a different timezone, or check back soon — no slots opened for the next 4 weeks.</p>
            </div>
          ) : slotsForDate.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No slots on this day. Try another date.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {amSlots.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-3">
                    <FontAwesomeIcon icon={faMugHot} className="size-3 text-amber-500" /> Morning
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {amSlots.map((s, i) => (
                      <TimeButton key={i} active={selectedSlot?.start === s.start} label={formatSlotTime(s.startLocal)} onClick={() => setSelectedSlot(s)} />
                    ))}
                  </div>
                </div>
              )}
              {pmSlots.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-3">
                    <FontAwesomeIcon icon={faSun} className="size-3 text-amber-500" /> Afternoon &amp; Evening
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {pmSlots.map((s, i) => (
                      <TimeButton key={i} active={selectedSlot?.start === s.start} label={formatSlotTime(s.startLocal)} onClick={() => setSelectedSlot(s)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Sticky CTA */}
      <div className="border-t border-border/60 p-5 md:p-6 bg-card/80 backdrop-blur-sm">
        <button
          onClick={goCheckout}
          disabled={!selectedSlot || navigating}
          className="w-full h-13 rounded-2xl bg-linear-to-r from-primary to-primary/90 text-primary-foreground text-base font-bold disabled:opacity-40 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {navigating ? (
            <span className="size-5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              {selectedSlot ? `Continue · ₹${offering.price.toLocaleString('en-IN')}` : 'Select a time to continue'}
              {selectedSlot && <FontAwesomeIcon icon={faArrowRight} className="size-4" />}
            </>
          )}
        </button>
      </div>
    </section>
  )

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 w-[calc(100%-1.5rem)] sm:w-full !max-w-lg md:!max-w-5xl h-[90vh] md:h-[min(86vh,800px)] overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl ring-1 ring-foreground/5"
      >
        <div className="flex flex-col md:grid md:grid-cols-5 h-full min-h-0">
          {leftPanel}
          {rightPanel}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 size-9 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <FontAwesomeIcon icon={faXmark} className="size-4" />
        </button>
      </DialogContent>
    </Dialog>
  )
}

// Full IANA list where supported, with a sensible curated fallback.
const TIMEZONES: string[] = (() => {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf
    if (typeof fn === 'function') return fn('timeZone')
  } catch { /* noop */ }
  return [
    'Asia/Kolkata', 'UTC', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo',
    'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Chicago',
    'America/Los_Angeles', 'Australia/Sydney',
  ]
})()

function TimezoneSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = TIMEZONES.includes(value) ? TIMEZONES : [value, ...TIMEZONES]
  return (
    <div className="relative shrink-0">
      <FontAwesomeIcon icon={faGlobe} className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-primary pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Your timezone"
        className="appearance-none h-9 max-w-37 truncate rounded-xl border border-border bg-card pl-7.5 pr-7 text-xs font-semibold text-foreground hover:border-primary/40 focus:outline-none focus:border-primary/60 cursor-pointer transition-colors"
      >
        {options.map((z) => (
          <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>
        ))}
      </select>
      <FontAwesomeIcon icon={faChevronDown} className="absolute right-2.5 top-1/2 -translate-y-1/2 size-2.5 text-muted-foreground pointer-events-none" />
    </div>
  )
}

function TimeButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-1 rounded-xl border text-sm font-bold text-center transition-all ${
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.03]'
          : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5'
      }`}
    >
      {label}
    </button>
  )
}
