'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faStar,
  faCircleCheck,
  faArrowLeft,
  faQuoteLeft,
  faShieldHeart,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AuthDialog } from '@/components/shared/auth-dialog'
import { toast } from '@/lib/toast'
import { authClient } from '@/lib/auth-client'
import { testimonialsService } from '@/services/testimonials.service'
import { isApiError } from '@/lib/api'
import { cn, getInitials } from '@/lib/utils'

interface TestimonialFormProps {
  username: string
  creatorName: string
  profilePhotoUrl: string | null
  initials: string
  niche: string | null
  avgRating: number
  totalReviews: number
  totalSessions: number
}

type FormState = 'idle' | 'submitting' | 'success'

interface Draft {
  name: string
  role: string
  rating: number
  content: string
}

const MIN_CHARS = 20
const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

export function TestimonialForm({
  username,
  creatorName,
  profilePhotoUrl,
  initials,
  niche,
  avgRating,
  totalReviews,
  totalSessions,
}: TestimonialFormProps): React.ReactElement {
  const draftKey = `testimonial-draft:${username}`
  const { data: session } = authClient.useSession()

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [content, setContent] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [submittedName, setSubmittedName] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const prefilledName = useRef(false)
  const resumedDraft = useRef(false)

  const trimmedLen = content.trim().length
  const contentValid = trimmedLen >= MIN_CHARS
  const canSubmit = !!name.trim() && rating > 0 && contentValid
  const activeStars = hovered || rating

  // Prefill the name from the signed-in account once (still editable).
  useEffect(() => {
    if (!prefilledName.current && session?.user?.name) {
      setName((prev) => prev || session.user.name)
      prefilledName.current = true
    }
  }, [session])

  const doSubmit = useCallback(
    async (draft: Draft) => {
      setFormState('submitting')
      try {
        await testimonialsService.submit(username, {
          learnerName: draft.name.trim(),
          learnerRole: draft.role.trim() || undefined,
          content: draft.content.trim(),
          rating: draft.rating,
        })
        sessionStorage.removeItem(draftKey)
        setSubmittedName(draft.name.trim())
        setFormState('success')
        toast.success('Review submitted!', 'Thank you for sharing your experience.')
      } catch (err) {
        setFormState('idle')
        if (isApiError(err) && err.status === 401) {
          setAuthOpen(true)
        } else if (isApiError(err) && err.status === 403) {
          toast.error('Not allowed', 'You cannot review your own profile.')
        } else if (isApiError(err) && err.status === 409) {
          toast.error('Already reviewed', "You've already left a review for this creator.")
        } else {
          toast.error('Failed to submit', 'Please try again.')
        }
      }
    },
    [username, draftKey],
  )

  // Returning from Google OAuth: restore the saved draft and finish the submit.
  useEffect(() => {
    if (resumedDraft.current || !session?.user) return
    const saved = sessionStorage.getItem(draftKey)
    if (!saved) return
    resumedDraft.current = true
    try {
      const draft = JSON.parse(saved) as Draft
      setName(draft.name)
      setRole(draft.role)
      setRating(draft.rating)
      setContent(draft.content)
      if (draft.name.trim() && draft.rating > 0 && draft.content.trim().length >= MIN_CHARS) {
        void doSubmit(draft)
      }
    } catch {
      sessionStorage.removeItem(draftKey)
    }
  }, [session, draftKey, doSubmit])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const draft: Draft = { name, role, rating, content }

    // Soft auth gate: save the draft, then prompt sign-in. Email/password resolves
    // in-page (onSuccess); Google round-trips and the draft is restored on return.
    if (!session?.user) {
      sessionStorage.setItem(draftKey, JSON.stringify(draft))
      setAuthOpen(true)
      return
    }

    await doSubmit(draft)
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-3xl border border-border bg-card/90 p-8 text-center shadow-xl backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10"
          >
            <FontAwesomeIcon icon={faCircleCheck} className="size-9 text-primary" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold text-foreground">Thanks, {submittedName}!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your review is in. {creatorName} will be notified, and it&apos;ll help others decide.
          </p>
          <Link
            href={`/c/${username}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
            Back to {creatorName}&apos;s profile
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        callbackURL={`/c/${username}/testimonial`}
        description={`Sign in to post your review for ${creatorName}.`}
      />

      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/c/${username}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
          Back to profile
        </Link>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Share your experience with {creatorName}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your honest review helps the next learner book with confidence.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(320px,400px)] lg:gap-8">
        {/* ── Left: form ───────────────────────────────────────────────────── */}
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onSubmit={handleSubmit}
          className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm backdrop-blur-sm sm:p-8"
        >
          {/* Star rating */}
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold">
              Overall rating <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-0.5 rounded-2xl border border-border bg-muted/40 p-1.5"
                onMouseLeave={() => setHovered(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = star <= activeStars
                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      className={cn(
                        'rounded-xl p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        filled ? 'bg-amber-400/10' : 'hover:bg-foreground/5',
                      )}
                      onMouseEnter={() => setHovered(star)}
                      onClick={() => setRating(star)}
                    >
                      <FontAwesomeIcon
                        icon={faStar}
                        className={cn(
                          'size-7 transition-all',
                          filled
                            ? 'scale-105 text-amber-400 drop-shadow-[0_1px_3px_oklch(0.8_0.16_85/0.5)]'
                            : 'text-zinc-300 dark:text-zinc-600',
                        )}
                      />
                    </button>
                  )
                })}
              </div>
              <AnimatePresence mode="wait">
                {activeStars > 0 && (
                  <motion.span
                    key={activeStars}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-sm font-bold text-amber-600 dark:text-amber-400"
                  >
                    {activeStars}.0
                    <span className="font-semibold text-foreground/70">{RATING_LABELS[activeStars]}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold">
                Your name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-sm font-semibold">
                Role / Title <span className="text-[11px] font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. UX Designer at Flipkart"
              />
            </div>
          </div>

          {/* Review */}
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="content" className="text-sm font-semibold">
              Your review <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What did you gain from working with ${creatorName}? Be specific — what changed for you?`}
              rows={5}
              className="resize-none"
            />
            {/* Progress toward the minimum */}
            <div className="flex items-center gap-3 pt-0.5">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn('h-full rounded-full', contentValid ? 'bg-primary' : 'bg-amber-400')}
                  animate={{ width: `${Math.min(100, (trimmedLen / MIN_CHARS) * 100)}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                />
              </div>
              <span
                className={cn(
                  'shrink-0 text-[11px] font-medium tabular-nums',
                  contentValid ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {contentValid ? `${trimmedLen} chars` : `${MIN_CHARS - trimmedLen} more`}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-6 h-11 w-full rounded-full text-sm font-semibold"
            disabled={formState === 'submitting' || !canSubmit}
          >
            {formState === 'submitting' ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Submitting…
              </span>
            ) : (
              'Submit review'
            )}
          </Button>
          {!session?.user && (
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              You&apos;ll be asked to sign in before posting — your review is kept as you typed it.
            </p>
          )}
        </motion.form>

        {/* ── Right: live preview + creator context ────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="space-y-5 lg:sticky lg:top-24 lg:self-start"
        >
          {/* Creator context */}
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3.5">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-primary/10">
                {profilePhotoUrl ? (
                  <Image src={profilePhotoUrl} alt={creatorName} fill className="object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-base font-bold text-primary">
                    {initials}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-bold text-foreground">{creatorName}</p>
                {niche && <p className="truncate text-xs font-medium text-muted-foreground">{niche}</p>}
              </div>
            </div>

            {(totalSessions > 0 || totalReviews > 0 || avgRating > 0) && (
              <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-muted/30 py-3 text-center">
                <Stat label="Rating" value={avgRating > 0 ? avgRating.toFixed(1) : '—'} />
                <Stat label="Reviews" value={String(totalReviews)} />
                <Stat label="Sessions" value={String(totalSessions)} />
              </div>
            )}
          </div>

          {/* Live preview */}
          <div className="space-y-2.5">
            <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Live preview
            </p>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-primary/30 to-transparent" />
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {getInitials(name.trim() || 'You')}
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold leading-none text-foreground">
                    {name.trim() || 'Your name'}
                  </h4>
                  <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                    {role.trim() || niche || 'Learner'}
                  </p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FontAwesomeIcon
                      key={s}
                      icon={faStar}
                      className={cn('size-3', s <= rating ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-600')}
                    />
                  ))}
                </div>
              </div>
              <div className="relative">
                <FontAwesomeIcon icon={faQuoteLeft} className="absolute -left-1 -top-1 size-4 text-muted/40" />
                <p
                  className={cn(
                    'relative z-10 pl-5 text-sm leading-relaxed',
                    content.trim() ? 'text-foreground/90' : 'italic text-muted-foreground/50',
                  )}
                >
                  {content.trim() || 'Your words will appear here as you type…'}
                </p>
              </div>
            </div>
          </div>

          {/* Why it matters */}
          <ul className="space-y-2.5 px-1">
            <Tip icon={faShieldHeart} text="Honest, specific reviews build real trust on Creonex." />
            <Tip icon={faUsers} text="Booked a session? Yours shows a “Verified booking” badge." />
          </ul>
        </motion.aside>
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2">
      <p className="text-lg font-extrabold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  )
}

function Tip({ icon, text }: { icon: typeof faStar; text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-xs text-muted-foreground">
      <FontAwesomeIcon icon={icon} className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
      <span>{text}</span>
    </li>
  )
}
