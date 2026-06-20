'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft, faClock, faVideo, faCircleCheck, faCalendarDay,
  faLock, faShieldHalved, faLink, faCalendarCheck, faIndianRupeeSign,
  faUserCheck, faCreditCard, faDownload, faBolt,
} from '@fortawesome/free-solid-svg-icons'
import { bookingsService } from '@/services/bookings.service'
import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type {
  PublicOffering, PublicCreatorProfile, UserContext, CreateBookingRequest,
} from '@creonex/types'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: any) => { open(): void }
  }
}

interface Props {
  profile: PublicCreatorProfile
  offering: PublicOffering
  /** 1:1 only — the learner-picked slot (UTC ISO). Null for live_event / digital. */
  start: string | null
  end: string | null
  tz: string
}

export function CheckoutClient({ profile, offering, start, end, tz }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [loggedInUser, setLoggedInUser] = useState<UserContext | null>(null)

  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [topic, setTopic] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [meetUrl, setMeetUrl] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)

  // ── Type flavour ──────────────────────────────────────────────────────────────
  const isOneOnOne = offering.type === 'one_on_one'
  const isLiveEvent = offering.type === 'live_event'
  const isDigital = offering.type === 'digital'
  const isTimed = isOneOnOne || isLiveEvent

  // Event time: 1:1 from the picked slot; live_event from the fixed scheduledAt.
  const eventStart = isOneOnOne ? start : offering.scheduledAt
  const eventEnd = isOneOnOne
    ? end
    : isLiveEvent && offering.scheduledAt
      ? new Date(new Date(offering.scheduledAt).getTime() + (offering.durationMinutes ?? 60) * 60_000).toISOString()
      : null

  const displayName = profile.displayName ?? `@${profile.username}`
  // Preserve the 1:1 selection so Back reopens the slot dialog; others just go to profile.
  const backHref = isOneOnOne && start && end
    ? `/c/${profile.username}?${new URLSearchParams({ offering: offering.id, tz, start, end }).toString()}`
    : `/c/${profile.username}`

  // Per-type copy
  const copy = isDigital
    ? { heading: 'Complete your purchase', sub: "You're one step away from instant access.", cta: 'Pay & get access', successTitle: 'Purchase complete!' }
    : isLiveEvent
      ? { heading: 'Confirm your spot', sub: "You're one step away from registering.", cta: 'Pay & register', successTitle: "You're registered!" }
      : { heading: 'Complete your booking', sub: "You're one step away from your session.", cta: 'Pay & book', successTitle: 'Booking confirmed!' }

  // ── Auth detection ──────────────────────────────────────────────────────────────
  useEffect(() => {
    api.get<UserContext>(endpoints.users.me)
      .then((u) => { setIsLoggedIn(true); setLoggedInUser(u) })
      .catch(() => setIsLoggedIn(false))
  }, [])

  // ── Formatting (render the UTC instant in the chosen tz) ──────────────────────────
  const dateLabel = eventStart
    ? new Date(eventStart).toLocaleDateString('en-IN', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' })
    : null
  const timeLabel = eventStart && eventEnd
    ? `${new Date(eventStart).toLocaleTimeString('en-IN', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true })} – ${new Date(eventEnd).toLocaleTimeString('en-IN', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true })}`.replace(/am/g, 'AM').replace(/pm/g, 'PM')
    : null

  // ── Razorpay ──────────────────────────────────────────────────────────────────────
  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true)
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload = () => resolve(true)
      s.onerror = () => resolve(false)
      document.body.appendChild(s)
    })

  const handlePay = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Payment gateway failed to load. Check your connection.')

      // 1:1 sends the picked slot; live_event/digital let the server resolve the time.
      const payload: CreateBookingRequest = {
        offeringId: offering.id,
        ...(isOneOnOne && start ? { startTime: start, endTime: end ?? undefined, topic: topic || undefined } : {}),
        ...(isTimed ? { learnerTimezone: tz } : {}),
      }

      const created = isLoggedIn
        ? await bookingsService.createBooking(payload)
        : await bookingsService.createGuestBooking({
            ...payload,
            guestName,
            guestEmail,
            guestPhone: guestPhone || undefined,
          })

      setBookingId(created.bookingId)

      const name = isLoggedIn ? (loggedInUser?.name ?? '') : guestName
      const email = isLoggedIn ? (loggedInUser?.email ?? '') : guestEmail

      const rzp = new window.Razorpay({
        key: created.razorpayKeyId,
        amount: created.amountPaise,
        currency: created.currency,
        name: displayName,
        description: offering.title,
        order_id: created.razorpayOrderId,
        prefill: { name, email, contact: guestPhone || undefined },
        theme: { color: '#3b6ef6' },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          try {
            const dto = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }
            const confirmed = isLoggedIn
              ? await bookingsService.confirmBooking(created.bookingId, dto)
              : await bookingsService.confirmGuestBooking(created.bookingId, dto)
            setMeetUrl(confirmed.meetingUrl ?? null)
            setDone(true)
          } catch {
            setError('Payment succeeded but confirmation failed. Contact support with your booking ID.')
          } finally {
            setIsLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            setError('Payment was cancelled. You can try again whenever you’re ready.')
          },
        },
      })

      rzp.open()
    } catch (e) {
      setIsLoading(false)
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }, [offering, start, end, tz, topic, isLoggedIn, loggedInUser, guestName, guestEmail, guestPhone, displayName, isOneOnOne, isTimed])

  const detailsValid = isLoggedIn === true
    ? true
    : (guestName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail))

  // ── Success screen ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="rounded-3xl border border-border bg-card shadow-sm p-8 md:p-10 flex flex-col items-center text-center gap-6">
          <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <FontAwesomeIcon icon={faCalendarCheck} className="size-9 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">{copy.successTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
              {isLoggedIn
                ? isDigital
                  ? 'Your purchase is complete. Access it anytime from your library.'
                  : 'You’re all set. Find this anytime in your bookings.'
                : `A confirmation has been sent to ${guestEmail}.`}
            </p>
          </div>

          {/* Summary chip */}
          <div className="w-full rounded-2xl border border-border bg-muted/20 p-4 flex items-center gap-3 text-left">
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={isDigital ? faDownload : faCalendarDay} className="size-4.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{offering.title}</p>
              <p className="text-xs text-muted-foreground">
                {isDigital ? 'Digital product' : `${dateLabel} · ${timeLabel}`}
              </p>
            </div>
          </div>

          {isDigital ? (
            <div className="w-full rounded-2xl bg-muted/40 border border-border p-4 text-sm text-muted-foreground">
              Your download links and access details {isLoggedIn ? 'are available in your library' : 'have been emailed to you'}.
            </div>
          ) : meetUrl ? (
            <div className="w-full flex flex-col gap-2.5">
              <a
                href={meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                <FontAwesomeIcon icon={faVideo} className="size-4" />
                Join Google Meet
              </a>
              <Button
                variant="outline"
                onClick={() => { navigator.clipboard.writeText(meetUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                className="w-full h-11 rounded-2xl text-xs font-semibold"
              >
                <FontAwesomeIcon icon={faLink} className="size-3 mr-1.5" />
                {copied ? 'Link copied!' : 'Copy Meet link'}
              </Button>
            </div>
          ) : (
            <div className="w-full rounded-2xl bg-muted/40 border border-border p-4 text-sm text-muted-foreground">
              {displayName} will share the {isLiveEvent ? 'event' : 'session'} details with you over email beforehand.
            </div>
          )}

          {!isLoggedIn && bookingId && (
            <div className="w-full rounded-2xl bg-primary/5 border border-primary/20 p-4 text-left">
              <p className="text-xs font-bold text-primary mb-1">Track your purchases</p>
              <p className="text-xs text-muted-foreground mb-3">Create a free account to manage everything in one place.</p>
              <Link href="/sign-up" className="inline-flex items-center text-xs font-bold text-primary hover:underline">
                Create free account →
              </Link>
            </div>
          )}

          <Link
            href={`/c/${profile.username}`}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to {displayName}
          </Link>
        </div>
      </div>
    )
  }

  // ── Checkout form ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Back + heading */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
        Back to {displayName}
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display mb-1">{copy.heading}</h1>
      <p className="text-sm text-muted-foreground mb-8">{copy.sub}</p>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 lg:gap-10 items-start">

        {/* ── Form (left on desktop, below summary on mobile) ── */}
        <div className="order-2 lg:order-1 flex flex-col gap-6">

          {/* Details */}
          <section className="rounded-3xl border border-border bg-card shadow-sm p-6 md:p-7">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">1</span>
              <h2 className="text-base font-bold text-foreground font-display">Your details</h2>
            </div>

            {isLoggedIn === null ? (
              <div className="h-20 flex items-center text-sm text-muted-foreground">Loading…</div>
            ) : isLoggedIn ? (
              <div className="flex items-center gap-3 bg-muted/30 border border-border rounded-2xl p-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faUserCheck} className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{loggedInUser?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{loggedInUser?.email}</p>
                </div>
                <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full shrink-0">
                  Signed in
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full name" required>
                    <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" className="h-11" />
                  </Field>
                  <Field label="Email" required>
                    <Input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="you@example.com" className="h-11" />
                  </Field>
                </div>
                <Field label="Phone" optional>
                  <Input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+91 98765 43210" className="h-11" />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/sign-in" className="text-primary hover:underline font-semibold">Sign in</Link>
                  {' '}for faster checkout.
                </p>
              </div>
            )}
          </section>

          {/* Topic (1:1 only) */}
          {isOneOnOne && (
            <section className="rounded-3xl border border-border bg-card shadow-sm p-6 md:p-7">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">2</span>
                <h2 className="text-base font-bold text-foreground font-display">
                  What would you like to discuss? <span className="text-muted-foreground/50 font-normal text-sm">(optional)</span>
                </h2>
              </div>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Share some context about your goals or questions so the session is more useful…"
                rows={4}
                className="resize-none"
              />
            </section>
          )}

          {error && (
            <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          {/* Desktop pay button */}
          <Button
            onClick={handlePay}
            disabled={!detailsValid || isLoading || isLoggedIn === null}
            className="hidden lg:flex w-full h-13 rounded-2xl text-base font-bold"
          >
            {isLoading ? (
              <span className="size-5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <FontAwesomeIcon icon={faLock} className="size-3.5 mr-1" />
                {copy.cta} · ₹{offering.price.toLocaleString('en-IN')}
              </>
            )}
          </Button>
        </div>

        {/* ── Order summary (right on desktop, top on mobile) ── */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            {/* header */}
            <div className="relative overflow-hidden bg-linear-to-br from-primary/12 via-card to-card p-6 border-b border-border/60">
              <div className="pointer-events-none absolute -top-12 -right-8 size-36 rounded-full bg-primary/15 blur-3xl" />
              <p className="relative text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Order summary</p>
              <div className="relative flex items-center gap-3.5">
                <div className="size-14 rounded-2xl overflow-hidden bg-primary/10 ring-2 ring-card shadow-sm shrink-0">
                  {profile.profilePhotoUrl ? (
                    <Image src={profile.profilePhotoUrl} alt={displayName} width={56} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-extrabold">
                      {getInitials(displayName)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground leading-tight font-display truncate">{offering.title}</p>
                  <p className="text-xs text-muted-foreground truncate">with {displayName}</p>
                </div>
              </div>
            </div>

            {/* details */}
            <div className="p-6 flex flex-col gap-4">
              {isTimed && dateLabel && (
                <>
                  <SummaryRow icon={faCalendarDay} label="Date" value={dateLabel} />
                  <SummaryRow icon={faClock} label="Time" value={timeLabel ?? ''} sub={tz} />
                  <SummaryRow icon={faVideo} label="Where" value="Google Meet (link after payment)" />
                </>
              )}
              {isDigital && (
                <SummaryRow icon={faBolt} label="Delivery" value="Instant access after payment" />
              )}

              <div className="border-t border-dashed border-border my-1" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{isDigital ? 'Product price' : 'Price'}</span>
                <span className="font-semibold text-foreground">₹{offering.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-xl font-extrabold text-foreground flex items-center">
                  <FontAwesomeIcon icon={faIndianRupeeSign} className="size-3.5" />
                  {offering.price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Mobile pay button */}
            <div className="lg:hidden p-6 pt-0">
              <Button
                onClick={handlePay}
                disabled={!detailsValid || isLoading || isLoggedIn === null}
                className="w-full h-13 rounded-2xl text-base font-bold"
              >
                {isLoading ? (
                  <span className="size-5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLock} className="size-3.5 mr-1" />
                    {copy.cta}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* trust badges */}
          <div className="mt-4 flex flex-col gap-2 px-1">
            <TrustLine icon={faShieldHalved} text="Secured by Razorpay · SSL encrypted" />
            <TrustLine icon={faCreditCard} text="UPI, cards & net banking accepted" />
            {!isDigital && <TrustLine icon={faCircleCheck} text="Free reschedule up to 24h before" />}
          </div>
        </aside>
      </div>
    </div>
  )
}

// ── Small pieces ──────────────────────────────────────────────────────────────────
function Field({ label, required, optional, children }: {
  label: string; required?: boolean; optional?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {optional && <span className="text-muted-foreground/40 font-normal ml-1 normal-case tracking-normal">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

function SummaryRow({ icon, label, value, sub }: {
  icon: typeof faClock; label: string; value: string; sub?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
        <FontAwesomeIcon icon={icon} className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

function TrustLine({ icon, text }: { icon: typeof faClock; text: string }) {
  return (
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <FontAwesomeIcon icon={icon} className="size-3 text-primary/60" />
      {text}
    </p>
  )
}
