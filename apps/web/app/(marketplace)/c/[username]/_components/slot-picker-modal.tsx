'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faXmark, faClock, faIndianRupeeSign, faArrowRight,
  faChevronLeft, faChevronRight, faCircleCheck, faShieldHalved,
  faVideo, faCalendarDay, faGlobe, faChevronDown, faCheck,
} from '@fortawesome/free-solid-svg-icons'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { getInitials } from '@/lib/utils'
import { useOfferingSlots } from '../_hooks/use-offering-slots'
import type { PublicOffering, PublicCreatorProfile } from '@creonex/types'
import type { SlotItem } from '@/services/slots.service'

interface Props {
  offering: PublicOffering
  profile: PublicCreatorProfile
  onClose: () => void
  /** Close is a navigation back to the profile — true while it's in flight. */
  closing?: boolean
}

export function SlotPickerModal({ offering, profile, onClose, closing = false }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const restoredRef = useRef(false)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null)
  const [viewMonth, setViewMonth] = useState<Date | null>(null)
  const [tz, setTz] = useState(() => searchParams.get('tz') ?? Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [navigating, setNavigating] = useState(false)

  const { slots, slotsByDate, availableDates, loading: slotsLoading } = useOfferingSlots(offering.id, tz)
  const isVerified = profile.qualityTier === 'verified' || profile.qualityTier === 'featured'
  const today = todayInTz(tz)

  // ── Initialise selection once slots arrive ──────────────────────────────────────
  // Runs after every fetch settles: a tz change resets to the first open day. On the
  // first load it also restores a slot from the URL (back-from-checkout / shared link)
  // — slot.start is a tz-independent UTC instant, so it matches across any tz.
  useEffect(() => {
    if (slotsLoading) return
    let initialDate = availableDates[0] ?? null
    let restored: SlotItem | null = null
    if (!restoredRef.current) {
      restoredRef.current = true
      const wanted = searchParams.get('start')
      const found = wanted ? slots.find((s) => s.start === wanted) : undefined
      if (found) {
        restored = found
        initialDate = found.startLocal.slice(0, 10)
      }
    }
    setSelectedSlot(restored)
    setSelectedDate(initialDate)
    setViewMonth(monthStart(initialDate ?? today))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsLoading, slots])

  // ── Helpers ───────────────────────────────────────────────────────────────────
  // startLocal is wall-clock in the selected tz ("YYYY-MM-DDTHH:mm:ss±zz:zz"). Read it
  // as a string so display stays correct for ANY chosen tz (not the browser's).
  const formatSlotTime = (isoLocal: string) => {
    const h = Number(isoLocal.slice(11, 13))
    const m = isoLocal.slice(14, 16)
    return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`
  }

  const slotsForDate = selectedDate ? (slotsByDate[selectedDate] ?? []) : []

  const availableSet = new Set(availableDates)
  const minMonth = availableDates.length ? monthKey(availableDates[0]) : null
  const maxMonth = availableDates.length ? monthKey(availableDates[availableDates.length - 1]) : null
  const vmKey = viewMonth ? viewMonth.getFullYear() * 12 + viewMonth.getMonth() : 0
  const canPrev = minMonth !== null && vmKey > minMonth
  const canNext = maxMonth !== null && vmKey < maxMonth
  const shiftMonth = (delta: number) =>
    setViewMonth((vm) => (vm ? new Date(vm.getFullYear(), vm.getMonth() + delta, 1) : vm))

  const goCheckout = () => {
    if (!selectedSlot) return
    setNavigating(true)
    const sel = { offering: offering.id, tz, start: selectedSlot.start, end: selectedSlot.end }
    // Enrich the current history entry so browser Back reopens this dialog restored,
    // then continue to checkout.
    router.replace(`/c/${profile.username}?${new URLSearchParams(sel).toString()}`, { scroll: false })
    router.push(`/checkout?${new URLSearchParams({ creator: profile.username, ...sel }).toString()}`)
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
              <p className="text-sm text-muted-foreground truncate">{longDate(selectedDate)}</p>
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
    <section className="flex flex-col md:col-span-3 md:min-h-0">
      {/* Header */}
      <div className="shrink-0 px-6 md:px-8 pt-6 md:pt-7 pb-4 flex items-start justify-between gap-3 border-b border-border/50">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground font-display">Select a date &amp; time</h2>
          <p className="text-sm text-muted-foreground mt-0.5">All times shown in your timezone.</p>
        </div>
        <TimezoneSelect value={tz} onChange={setTz} />
      </div>

      {/* Body */}
      {slotsLoading ? (
        <CalendarSkeleton />
      ) : availableDates.length === 0 ? (
        <div className="flex min-h-[18rem] md:flex-1 flex-col items-center justify-center gap-3 text-center p-8">
          <div className="size-14 rounded-2xl bg-muted/50 flex items-center justify-center">
            <FontAwesomeIcon icon={faClock} className="size-6 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">No availability right now</p>
            <p className="text-sm text-muted-foreground max-w-xs mt-1">
              Try a different timezone, or check back soon — no open slots in the next 4 weeks.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:flex-1 md:min-h-0">
          {/* Calendar */}
          <div className="shrink-0 md:w-[18.5rem] p-6 md:p-7 border-b md:border-b-0 md:border-r border-border/50">
            {viewMonth && (
              <MonthCalendar
                viewMonth={viewMonth}
                selectedDate={selectedDate}
                availableDates={availableSet}
                today={today}
                onSelectDate={(d) => { setSelectedDate(d); setSelectedSlot(null) }}
                onPrev={() => shiftMonth(-1)}
                onNext={() => shiftMonth(1)}
                canPrev={canPrev}
                canNext={canNext}
              />
            )}
          </div>

          {/* Times */}
          <div className="flex flex-col md:flex-1 md:min-h-0">
            <div className="shrink-0 px-6 md:px-7 pt-5 pb-3">
              <p className="text-sm font-semibold text-foreground">
                {selectedDate ? longDate(selectedDate) : 'Select a date'}
              </p>
              {selectedDate && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {slotsForDate.length} {slotsForDate.length === 1 ? 'slot' : 'slots'} available
                </p>
              )}
            </div>
            <div className="md:flex-1 md:min-h-0 md:overflow-y-auto">
              <div key={selectedDate} className="px-6 md:px-7 pb-6 flex flex-col gap-2 animate-in fade-in duration-200">
                {slotsForDate.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No slots on this day. Pick another date.</p>
                ) : (
                  slotsForDate.map((s) => (
                    <TimeRow
                      key={s.start}
                      active={selectedSlot?.start === s.start}
                      label={formatSlotTime(s.startLocal)}
                      onClick={() => setSelectedSlot(s)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA — sticky on mobile so it's always reachable, in-flow on desktop */}
      <div className="shrink-0 sticky bottom-0 md:static border-t border-border/60 bg-card p-5 md:p-6">
        <button
          onClick={goCheckout}
          disabled={!selectedSlot || navigating}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {navigating ? (
            <span className="size-5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
          ) : selectedSlot ? (
            <>
              Continue · ₹{offering.price.toLocaleString('en-IN')}
              <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
            </>
          ) : (
            'Select a time to continue'
          )}
        </button>
      </div>
    </section>
  )

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 w-[calc(100%-1.5rem)] sm:w-full !max-w-lg md:!max-w-5xl h-[90vh] md:h-[min(86vh,760px)] overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl ring-1 ring-foreground/5 flex flex-col"
      >
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto md:grid md:grid-cols-5 md:grid-rows-1 md:overflow-hidden">
          {leftPanel}
          {rightPanel}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          disabled={closing}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 size-9 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted active:scale-90 transition-all disabled:cursor-default disabled:opacity-100"
        >
          {closing ? (
            <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          ) : (
            <FontAwesomeIcon icon={faXmark} className="size-4" />
          )}
        </button>
      </DialogContent>
    </Dialog>
  )
}

// ── Date helpers ──────────────────────────────────────────────────────────────────
const pad2 = (n: number) => String(n).padStart(2, '0')
/** 'YYYY-MM-DD' from a 0-indexed month. */
const ymd = (y: number, m: number, d: number) => `${y}-${pad2(m + 1)}-${pad2(d)}`
/** Year*12 + 0-indexed month, from a 'YYYY-MM-DD' string. */
const monthKey = (dateStr: string) => {
  const [y, m] = dateStr.split('-').map(Number)
  return y * 12 + (m - 1)
}
/** First-of-month Date from a 'YYYY-MM-DD' string. */
const monthStart = (dateStr: string) => {
  const [y, m] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, 1)
}
/** Today as 'YYYY-MM-DD' in the given tz (en-CA renders ISO order). */
const todayInTz = (tz: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
/** "Thursday, 16 June" from a 'YYYY-MM-DD' string. */
const longDate = (dateStr: string) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

// ── Month calendar ──────────────────────────────────────────────────────────────────
function MonthCalendar({
  viewMonth, selectedDate, availableDates, today, onSelectDate, onPrev, onNext, canPrev, canNext,
}: {
  viewMonth: Date
  selectedDate: string | null
  availableDates: Set<string>
  today: string
  onSelectDate: (d: string) => void
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
}) {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const leading = (new Date(year, month, 1).getDay() + 6) % 7 // Monday-first offset
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const navBtn = 'size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground transition-all cursor-pointer hover:text-foreground hover:border-primary/50 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:border-border disabled:active:scale-100'

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-foreground">
          {viewMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex items-center gap-1.5">
          <button onClick={onPrev} disabled={!canPrev} aria-label="Previous month" className={navBtn}>
            <FontAwesomeIcon icon={faChevronLeft} className="size-3" />
          </button>
          <button onClick={onNext} disabled={!canNext} aria-label="Next month" className={navBtn}>
            <FontAwesomeIcon icon={faChevronRight} className="size-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground/60 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`b${i}`} />
          const dateStr = ymd(year, month, day)
          const available = availableDates.has(dateStr)
          const selected = dateStr === selectedDate
          const isToday = dateStr === today
          return (
            <button
              key={dateStr}
              onClick={() => available && onSelectDate(dateStr)}
              disabled={!available}
              aria-pressed={selected}
              className={`relative aspect-square rounded-lg text-sm flex items-center justify-center transition-all ${
                selected
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm cursor-pointer'
                  : available
                    ? 'bg-primary/5 text-foreground font-semibold cursor-pointer hover:bg-primary/15 hover:text-primary hover:scale-105 active:scale-95'
                    : 'text-muted-foreground/30 font-normal cursor-not-allowed'
              }`}
            >
              {day}
              {isToday && !selected && (
                <span className="absolute inset-0 rounded-lg ring-1 ring-primary/50 pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CalendarSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 flex-col md:flex-row">
      <div className="shrink-0 md:w-[18.5rem] p-6 md:p-7 border-b md:border-b-0 md:border-r border-border/50">
        <div className="h-5 w-32 rounded bg-foreground/20 animate-pulse mb-5" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-foreground/10 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6 md:p-7 flex flex-col gap-2.5">
        <div className="h-4 w-40 rounded bg-foreground/20 animate-pulse mb-1" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-foreground/10 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function TimeRow({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-12 rounded-xl border px-4 flex items-center justify-between text-sm font-semibold transition-all cursor-pointer active:scale-[0.98] ${
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
          : 'border-border text-foreground hover:border-primary hover:text-primary hover:bg-primary/5'
      }`}
    >
      <span>{label}</span>
      {active && <FontAwesomeIcon icon={faCheck} className="size-3.5" />}
    </button>
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
