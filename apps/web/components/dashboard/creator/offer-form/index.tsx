'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faCalendarDays,
  faUsers,
  faFileLines,
  faCheck,
  faSpinner,
  faChevronDown,
  faLock,
  faClock,
  faArrowRight,
  faInfoCircle,
  faTrophy,
  faLockOpen,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { offeringsService } from '@/services/offerings.service'
import { isApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { CreatorOffering, OfferCreationEligibility, OfferType } from '@creonex/types'

// ── Offer type metadata ───────────────────────────────────────────────────────
const TYPE_META: Record<OfferType, { label: string; description: string; icon: IconDefinition }> = {
  one_on_one: {
    label: '1:1 Session',
    description: 'Private 1-on-1 coaching video call',
    icon: faPhone,
  },
  workshop: {
    label: 'Workshop',
    description: 'Live interactive class or lecture for groups',
    icon: faCalendarDays,
  },
  group: {
    label: 'Group Call',
    description: 'Mentorship, Q&As, or mastermind discussions',
    icon: faUsers,
  },
  digital: {
    label: 'Digital Product',
    description: 'Downloadable templates, guides, or resources',
    icon: faFileLines,
  },
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120]
const SUGGESTED_PRICES = [199, 299, 499, 799, 999, 1499]

const asNumber = { setValueAs: (v: string): number | undefined => (v === '' || v == null ? undefined : Number(v)) }

const needsDuration = (t?: OfferType): boolean => t === 'one_on_one' || t === 'workshop' || t === 'group'
const needsSeats = (t?: OfferType): boolean => t === 'workshop' || t === 'group'
const isBookable = (t?: OfferType): boolean => t === 'one_on_one' || t === 'group'

// ── Schema (mirrors API CreateOfferingDto) ────────────────────────────────────
const offerSchema = z
  .object({
    type: z.enum(['one_on_one', 'workshop', 'group', 'digital'] as const, {
      message: 'Choose an offer type',
    }),
    title: z.string().min(5, 'Title must be at least 5 characters').max(80, 'Keep the title under 80 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description is too long'),
    price: z.number({ message: 'Enter a price' }).min(99, 'Minimum price is ₹99').max(500000, 'Price is too high'),
    durationMinutes: z.number().min(15, 'Min 15 minutes').max(480, 'Max 480 minutes').optional(),
    seatsTotal: z.number().min(2, 'At least 2 seats').max(500, 'Max 500 seats').optional(),
    minNoticeMinutes: z.number().min(0).max(10080).optional(),
    bookingWindowDays: z.number().min(1).max(365).optional(),
    bufferAfterMinutes: z.number().min(0).max(120).optional(),
  })
  .superRefine((val, ctx) => {
    if (needsDuration(val.type) && !val.durationMinutes) {
      ctx.addIssue({ code: 'custom', path: ['durationMinutes'], message: 'Duration is required' })
    }
    if (needsSeats(val.type) && !val.seatsTotal) {
      ctx.addIssue({ code: 'custom', path: ['seatsTotal'], message: 'Seat count is required' })
    }
  })

export type OfferFormValues = z.infer<typeof offerSchema>

interface OfferFormProps {
  offering?: CreatorOffering
  eligibility?: OfferCreationEligibility
}

export function OfferForm({ offering, eligibility }: OfferFormProps = {}): React.ReactElement {
  const router = useRouter()
  const isEdit = !!offering
  const [submitting, setSubmitting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Type gating — group/workshop unlock after enough completed 1:1 sessions.
  const lockedTypes = new Set<string>(eligibility?.lockedTypes ?? [])
  const hasLockedTypes = lockedTypes.size > 0
  const completedSessions = eligibility?.completedOneOnOneSessions ?? 0
  const requiredSessions = eligibility?.requiredSessions ?? 0
  const sessionsLeft = Math.max(requiredSessions - completedSessions, 0)
  const unlockProgress = requiredSessions > 0 ? Math.min(completedSessions / requiredSessions, 1) : 1

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    mode: 'onChange',
    defaultValues: offering
      ? {
          type: offering.type as OfferType,
          title: offering.title,
          description: offering.description ?? '',
          price: offering.price,
          durationMinutes: offering.durationMinutes ?? undefined,
          seatsTotal: offering.seatsTotal ?? undefined,
          minNoticeMinutes: offering.minNoticeMinutes ?? undefined,
          bookingWindowDays: offering.bookingWindowDays ?? undefined,
          bufferAfterMinutes: offering.bufferAfterMinutes ?? undefined,
        }
      : { type: undefined, title: '', description: '', price: undefined, durationMinutes: 45 },
  })

  const type = watch('type')
  const title = watch('title')
  const description = watch('description')
  const price = watch('price')
  const durationMinutes = watch('durationMinutes')
  const seatsTotal = watch('seatsTotal')
  const minNoticeMinutes = watch('minNoticeMinutes')
  const bookingWindowDays = watch('bookingWindowDays')
  const bufferAfterMinutes = watch('bufferAfterMinutes')

  // Helper notice translations
  const getNoticeText = (mins?: number): string | null => {
    if (mins === undefined || mins === null) return null
    if (mins === 0) return 'Learners can book sessions instantly up to the start time.'
    if (mins < 60) return `Learners must book at least ${mins} minutes before the session starts.`
    const hours = mins / 60
    if (hours < 24) return `Learners must book at least ${hours} ${hours === 1 ? 'hour' : 'hours'} before the session starts.`
    const days = hours / 24
    return `Learners must book at least ${days} ${days === 1 ? 'day' : 'days'} before the session starts.`
  }

  const getWindowText = (days?: number): string | null => {
    if (!days) return null
    if (days === 1) return 'Slots will only be open for bookings scheduled for today.'
    if (days === 7) return 'Slots will be open for bookings up to 1 week in advance.'
    if (days === 30) return 'Slots will be open for bookings up to 1 month in advance.'
    return `Slots will be open for bookings up to ${days} days in advance.`
  }

  const getBufferText = (mins?: number): string | null => {
    if (mins === undefined || mins === null) return null
    if (mins === 0) return 'No buffer time. Bookings can happen back-to-back.'
    return `Adds a ${mins}-minute break after bookings for you to rest or prepare.`
  }

  const titleLength = title?.length ?? 0
  const titleColor = titleLength > 70 ? 'text-destructive font-medium' : titleLength > 60 ? 'text-amber-500 font-medium' : 'text-muted-foreground font-normal'

  const descLength = description?.length ?? 0
  const descColor = descLength > 1850 ? 'text-destructive font-medium' : descLength > 1500 ? 'text-amber-500 font-medium' : 'text-muted-foreground font-normal'

  // `publish` only applies to create: true → go live immediately, false → keep
  // as an editable (and deletable) draft. Editing never changes status here.
  async function onSubmit(data: OfferFormValues, publish: boolean): Promise<void> {
    setSubmitting(true)
    const body = {
      title: data.title,
      description: data.description,
      price: data.price,
      durationMinutes: needsDuration(data.type) ? data.durationMinutes : undefined,
      seatsTotal: needsSeats(data.type) ? data.seatsTotal : undefined,
      minNoticeMinutes: isBookable(data.type) ? data.minNoticeMinutes : undefined,
      bookingWindowDays: isBookable(data.type) ? data.bookingWindowDays : undefined,
      bufferAfterMinutes: isBookable(data.type) ? data.bufferAfterMinutes : undefined,
    }

    try {
      if (isEdit) {
        await offeringsService.updateOffering(offering.id, body)
        toast.success('Offer updated.', { description: `"${data.title}" saved.` })
      } else {
        const created = await offeringsService.createOffering({ type: data.type, ...body })
        if (publish) {
          await offeringsService.transitionStatus(created.id, 'live')
          toast.success('Offer published!', { description: `"${data.title}" is now live.` })
        } else {
          toast.success('Draft saved.', { description: `"${data.title}" saved as a draft.` })
        }
      }
      router.push('/offers')
      router.refresh()
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not save offer. Try again.')
      setSubmitting(false)
    }
  }

  // Pre-calculated stats for the preview
  const displayTitle = title || 'Untitled Offering'
  const displayPrice = price || 0
  const displayDuration = needsDuration(type) ? (durationMinutes ? `${durationMinutes} min` : '45 min') : null
  const displaySeats = needsSeats(type) ? (seatsTotal ? `${seatsTotal} seats` : '20 seats') : null
  const typeStyle = type ? TYPE_META[type] : null

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
      {/* ── Left Column: Form Inputs ── */}
      <form onSubmit={handleSubmit((d) => onSubmit(d, true))} className="lg:col-span-7 space-y-8 bg-card border border-border/80 p-6 sm:p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.015)]">
        {/* ── Section: Offer type ── */}
        <section className="space-y-4">
          <SectionHeading title="Offer type" subtitle="What format are you selling?" />
          {isEdit ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-background text-primary">
                <FontAwesomeIcon icon={typeStyle?.icon ?? faFileLines} className="size-4.5" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold">{typeStyle?.label ?? type}</p>
                <p className="text-xs text-muted-foreground">Offer type can't be changed after creation</p>
              </div>
              <FontAwesomeIcon icon={faLock} className="size-4 text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Unlocked celebratory banner */}
              {eligibility?.unlocked && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FontAwesomeIcon icon={faTrophy} className="size-5 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      🎉 Advanced Formats Unlocked!
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                      Outstanding! You've successfully completed {completedSessions} 1:1 sessions. You are now fully eligible to create Workshops and Group Calls!
                    </p>
                    <p className="text-[10px] text-muted-foreground/85 leading-normal font-normal">
                      * All offering formats (1:1, Digital Products, Group Calls, and Workshops) are now available to publish.
                    </p>
                  </div>
                </div>
              )}

              {/* Unlock progress — shown while group/workshop are still locked. */}
              {hasLockedTypes && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FontAwesomeIcon icon={faTrophy} className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        Unlock Group Calls & Workshops
                      </p>
                      <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed font-normal">
                        {sessionsLeft === 1 ? (
                          <span>Almost there — complete just <span className="font-semibold text-foreground">1 more 1:1 session</span> to unlock group calls & workshops!</span>
                        ) : (
                          <span>Complete <span className="font-semibold text-foreground">{sessionsLeft} more 1:1 sessions</span> to unlock group calls & workshops.</span>
                        )}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground/80 font-normal mt-1.5">
                        💡 1:1 Sessions and Digital Products are available to create and sell from day one.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${unlockProgress * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>{completedSessions} of {requiredSessions} sessions completed</span>
                      <span>{Math.round(unlockProgress * 100)}% completed</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(Object.keys(TYPE_META) as OfferType[]).map((key) => {
                  const item = TYPE_META[key]
                  const isLocked = lockedTypes.has(key)
                  const isSelected = type === key && !isLocked
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-disabled={isLocked}
                      onClick={() => !isLocked && setValue('type', key, { shouldValidate: true })}
                      className={cn(
                        'relative flex flex-col items-stretch gap-3 rounded-xl border p-4 text-left transition-all duration-200 outline-none group/locked',
                        isLocked
                          ? 'border-dashed border-border/80 bg-muted/20 hover:bg-muted/30 cursor-not-allowed'
                          : isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border bg-card hover:bg-muted/30 hover:border-foreground/15',
                      )}
                    >
                      {/* Floating tooltip above the locked card */}
                      {isLocked && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 opacity-0 pointer-events-none group-hover/locked:opacity-100 group-hover/locked:pointer-events-auto transition-opacity duration-200 z-30 w-64 bg-popover text-popover-foreground border border-border p-2.5 rounded-lg text-xs leading-normal shadow-md">
                          <p className="font-semibold mb-0.5">Advanced Format Locked</p>
                          <p className="text-muted-foreground font-normal">This format requires {requiredSessions} completed 1:1 sessions. Complete {sessionsLeft} more session{sessionsLeft === 1 ? '' : 's'} to unlock.</p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-popover border-r border-b border-border rotate-45" />
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                            isLocked
                              ? 'bg-muted text-muted-foreground/60'
                              : isSelected
                                ? 'bg-primary text-primary-foreground bg-linear-to-br from-primary to-primary/80'
                                : 'bg-muted text-muted-foreground',
                          )}
                        >
                          <FontAwesomeIcon icon={isLocked ? faLock : item.icon} className="size-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <p className={cn('text-base font-semibold', isLocked && 'text-muted-foreground/90')}>
                              {item.label}
                            </p>
                            {isLocked ? (
                              <span className="rounded-full bg-muted/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/80 border border-border">
                                Locked
                              </span>
                            ) : isSelected ? (
                              <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                                <FontAwesomeIcon icon={faCheck} className="size-2.5" />
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground leading-normal font-normal">
                            {isLocked ? `Complete 1:1 sessions to unlock this format.` : item.description}
                          </p>
                        </div>
                      </div>

                      {/* Locked progress tracker inside locked cards */}
                      {isLocked && (
                        <div className="mt-3.5 space-y-1.5 pt-3 border-t border-border/40 border-dashed w-full">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold leading-none">
                            <span>Unlock progress</span>
                            <span>{completedSessions}/{requiredSessions}</span>
                          </div>
                          <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden">
                            <div className="h-full bg-muted-foreground/35 rounded-full" style={{ width: `${unlockProgress * 100}%` }} />
                          </div>
                          <p className="text-[10px] text-primary/80 font-medium leading-none mt-1">
                            {sessionsLeft === 1 ? 'Almost there — 1 more session!' : `${sessionsLeft} sessions away`}
                          </p>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              {errors.type && <FieldError message={errors.type.message} />}
            </>
          )}
        </section>

        <Separator className="opacity-60" />

        {/* ── Section: Details ── */}
        <section className="space-y-5">
          <SectionHeading title="Details" subtitle="Give your offer a clear title and description." />

          <Field
            label="Title"
            htmlFor="title"
            error={errors.title?.message}
            extraLabel={
              <span className={cn('text-xs tracking-wide', titleColor)}>
                {titleLength}/80
              </span>
            }
          >
            <Input
              id="title"
              placeholder={
                type === 'one_on_one'
                  ? 'e.g. 1:1 Portfolio Review & Feedback'
                  : type === 'workshop'
                    ? 'e.g. Intro to Figma Variable Systems'
                    : type === 'group'
                      ? 'e.g. Weekly Design Mastermind & Critique'
                      : 'e.g. Ultimate Tailwind UI Starter Kit'
              }
              maxLength={80}
              aria-invalid={!!errors.title}
              {...register('title')}
              className="bg-muted/10 focus-visible:bg-background transition-colors rounded-lg text-sm md:text-base h-11"
            />
          </Field>

          <Field
            label="Description"
            htmlFor="description"
            error={errors.description?.message}
            hint="Describe exactly what learners get, outcome goals, and key requirements."
            extraLabel={
              <span className={cn('text-xs tracking-wide', descColor)}>
                {descLength}/2000
              </span>
            }
          >
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Textarea
                  id="description"
                  rows={6}
                  placeholder="What will learners achieve? Be specific. Clear details boost booking rates."
                  maxLength={2000}
                  aria-invalid={!!errors.description}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className="bg-muted/10 focus-visible:bg-background transition-colors rounded-lg resize-y min-h-[120px] text-sm md:text-base p-3 font-normal"
                />
              )}
            />
          </Field>
        </section>

        <Separator className="opacity-60" />

        {/* ── Section: Pricing & format ── */}
        <section className="space-y-5">
          <SectionHeading title="Pricing & format" subtitle="Set your price and format specifications." />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Price */}
            <Field label="Price (₹)" htmlFor="price" error={errors.price?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground font-semibold">₹</span>
                <Input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  placeholder="499"
                  className="pl-7 bg-muted/10 focus-visible:bg-background transition-colors rounded-lg font-medium text-sm md:text-base h-11"
                  aria-invalid={!!errors.price}
                  {...register('price', asNumber)}
                />
              </div>
            </Field>

            {/* Duration — only for session types */}
            {needsDuration(type) && (
              <Field label="Duration" htmlFor="durationMinutes" error={errors.durationMinutes?.message}>
                <Controller
                  control={control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <Select
                      value={field.value != null ? String(field.value) : undefined}
                      onValueChange={(v) => field.onChange(v != null ? Number(v) : undefined)}
                    >
                      <SelectTrigger id="durationMinutes" className="w-full bg-muted/10 transition-colors rounded-lg text-sm md:text-base h-11" aria-invalid={!!errors.durationMinutes}>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((d) => (
                          <SelectItem key={d} value={String(d)}>
                            <span className="flex items-center gap-2 text-sm md:text-base">
                              <FontAwesomeIcon icon={faClock} className="size-3.5 text-muted-foreground/85" />
                              {d} minutes
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            )}

            {/* Seats — group / workshop */}
            {needsSeats(type) && (
              <Field label="Total seats available" htmlFor="seatsTotal" error={errors.seatsTotal?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80">
                    <FontAwesomeIcon icon={faUsers} className="size-4" />
                  </span>
                  <Input
                    id="seatsTotal"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 20"
                    className="pl-9 bg-muted/10 focus-visible:bg-background transition-colors rounded-lg text-sm md:text-base h-11"
                    aria-invalid={!!errors.seatsTotal}
                    {...register('seatsTotal', asNumber)}
                  />
                </div>
              </Field>
            )}
          </div>

          {/* Suggested prices */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground block">Quick Pricing Presets:</span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PRICES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue('price', p, { shouldValidate: true })}
                  className={cn(
                    'rounded-full border px-3.5 py-2 text-xs md:text-sm font-semibold transition-all duration-150',
                    price === p
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted/10',
                  )}
                >
                  ₹{p}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section: Advanced booking (collapsible, bookable types only) ── */}
        {isBookable(type) && (
          <>
            <Separator className="opacity-60" />
            <section className="space-y-4">
              <button
                type="button"
                onClick={() => setShowAdvanced((s) => !s)}
                className="flex w-full items-center justify-between text-left group"
              >
                <SectionHeading title="Booking configurations" subtitle="Notice periods, buffer times, and booking windows." />
                <div className="flex size-8 items-center justify-center rounded-full bg-muted/40 group-hover:bg-muted transition-colors">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={cn('size-4 text-muted-foreground transition-transform duration-200', showAdvanced && 'rotate-180')}
                  />
                </div>
              </button>

              {showAdvanced && (
                <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <Field label="Min notice" htmlFor="minNoticeMinutes" error={errors.minNoticeMinutes?.message}>
                      <Select
                        value={minNoticeMinutes !== undefined && minNoticeMinutes !== null ? String(minNoticeMinutes) : '120'}
                        onValueChange={(v) => setValue('minNoticeMinutes', Number(v), { shouldValidate: true })}
                      >
                        <SelectTrigger id="minNoticeMinutes" className="w-full bg-muted/10 rounded-lg text-sm md:text-base h-11">
                          <SelectValue placeholder="Notice period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Instant</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                          <SelectItem value="1440">24 hours</SelectItem>
                          <SelectItem value="2880">2 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Booking window" htmlFor="bookingWindowDays" error={errors.bookingWindowDays?.message}>
                      <Select
                        value={bookingWindowDays !== undefined && bookingWindowDays !== null ? String(bookingWindowDays) : '30'}
                        onValueChange={(v) => setValue('bookingWindowDays', Number(v), { shouldValidate: true })}
                      >
                        <SelectTrigger id="bookingWindowDays" className="w-full bg-muted/10 rounded-lg text-sm md:text-base h-11">
                          <SelectValue placeholder="Booking window" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Buffer after" htmlFor="bufferAfterMinutes" error={errors.bufferAfterMinutes?.message}>
                      <Select
                        value={bufferAfterMinutes !== undefined && bufferAfterMinutes !== null ? String(bufferAfterMinutes) : '0'}
                        onValueChange={(v) => setValue('bufferAfterMinutes', Number(v), { shouldValidate: true })}
                      >
                        <SelectTrigger id="bufferAfterMinutes" className="w-full bg-muted/10 rounded-lg text-sm md:text-base h-11">
                          <SelectValue placeholder="Buffer break" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No buffer</SelectItem>
                          <SelectItem value="10">10 min</SelectItem>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="45">45 min</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {/* Visual translations for configs */}
                  <div className="space-y-2.5 rounded-xl border border-border bg-muted/20 p-4 text-xs md:text-sm text-muted-foreground leading-relaxed">
                    <p className="flex items-center gap-2.5">
                      <FontAwesomeIcon icon={faInfoCircle} className="size-3.5 text-primary/75" />
                      <span>{getNoticeText(minNoticeMinutes ?? 120)}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <FontAwesomeIcon icon={faInfoCircle} className="size-3.5 text-primary/75" />
                      <span>{getWindowText(bookingWindowDays ?? 30)}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <FontAwesomeIcon icon={faInfoCircle} className="size-3.5 text-primary/75" />
                      <span>{getBufferText(bufferAfterMinutes ?? 0)}</span>
                    </p>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* ── Footer actions ── */}
        <div className="flex flex-col-reverse gap-3 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => router.push('/offers')}
            className="sm:w-auto rounded-lg text-sm md:text-base h-10.5 px-4 sm:mr-auto"
          >
            Cancel
          </Button>
          {!isEdit && (
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={handleSubmit((d) => onSubmit(d, false))}
              className="sm:w-auto rounded-lg text-sm md:text-base h-10.5 px-4"
            >
              Save as draft
            </Button>
          )}
          <Button
            type="button"
            disabled={submitting}
            onClick={handleSubmit((d) => onSubmit(d, true))}
            className="sm:w-auto rounded-lg shadow-xs text-sm md:text-base h-10.5 px-4"
          >
            <FontAwesomeIcon icon={submitting ? faSpinner : faCheck} className={cn('size-4 mr-1.5', submitting && 'animate-spin')} />
            {isEdit ? 'Save changes' : 'Publish offer'}
          </Button>
        </div>
      </form>

      {/* ── Right Column: Dynamic Sticky Live Preview ── */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
        {type ? (
          <>
            {/* Live Preview Title */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground">Learner Profile Preview</span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-wider">Live Preview</span>
              </div>
            </div>

            {/* Public Offering Card Mock */}
            <div className="relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:border-border/85 transition-all">
              {/* Theme primary strip */}
              <div className="h-1 w-full bg-linear-to-r from-primary to-primary/80" />

              <div className="p-5 flex flex-col flex-1 gap-4">
                {/* Type badge + duration */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 bg-primary/10 text-primary ring-primary/20">
                    <FontAwesomeIcon icon={typeStyle?.icon ?? faFileLines} className="size-3" />
                    {typeStyle?.label}
                  </span>
                  {displayDuration && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                      <FontAwesomeIcon icon={faClock} className="size-3" />
                      {displayDuration}
                    </span>
                  )}
                </div>

                {/* Title */}
                <p className="text-base md:text-lg font-semibold text-foreground leading-snug line-clamp-2 min-h-[54px]">
                  {displayTitle}
                </p>

                {/* Description snippet */}
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[60px] border-t border-border/40 pt-3 font-normal">
                  {description || 'Provide a brief description of this offering to showcase outcomes and benefits to potential learners.'}
                </p>

                {/* Seats indicator (if applicable) */}
                {displaySeats && (
                  <span className="inline-flex w-fit text-xs font-medium px-2 py-0.5 rounded-full bg-muted border border-border">
                    {displaySeats}
                  </span>
                )}

                {/* Price + arrow footer */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Price</p>
                    <p className="text-xl md:text-2xl font-semibold text-foreground leading-none">
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center justify-center size-10 rounded-full bg-linear-to-br from-primary to-primary/80 shrink-0 shadow-xs">
                    <FontAwesomeIcon icon={faArrowRight} className="size-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Split Visualization */}
            {displayPrice > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4">
                <h4 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block size-1.5 rounded-full bg-primary" />
                  Earnings Breakdown
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm md:text-base">
                    <span className="text-muted-foreground">Your takehome (90%)</span>
                    <span className="font-semibold text-primary">₹{Math.round(displayPrice * 0.9).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm md:text-base">
                    <span className="text-muted-foreground">Platform fee (10%)</span>
                    <span className="text-muted-foreground font-medium">₹{Math.round(displayPrice * 0.1).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-muted flex mt-2">
                    <div className="h-full bg-primary" style={{ width: '90%' }} />
                    <div className="h-full bg-muted-foreground/30" style={{ width: '10%' }} />
                  </div>
                </div>
                <Separator className="opacity-50" />
                <p className="text-xs text-muted-foreground leading-normal font-normal">
                  Creonex maintains a unified 10% platform fee. This covers instant payouts, secure payment gateways, video integrations, and hosting services.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="h-[320px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-6 text-center bg-card/40">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <FontAwesomeIcon icon={faInfoCircle} className="size-5.5" />
            </div>
            <p className="text-base font-semibold text-foreground">Select an offering type</p>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xs mt-1">
              Choose an offering style from the selector on the left to activate the live card preview.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Local presentational helpers ──────────────────────────────────────────────

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }): React.ReactElement {
  return (
    <div className="space-y-1">
      <h3 className="text-base md:text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  extraLabel,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  extraLabel?: React.ReactNode
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="font-medium text-sm md:text-base text-foreground/90">{label}</Label>
        {extraLabel}
      </div>
      {children}
      {error ? <FieldError message={error} /> : hint ? <p className="text-xs text-muted-foreground leading-normal">{hint}</p> : null}
    </div>
  )
}

function FieldError({ message }: { message?: string }): React.ReactElement {
  return <p className="text-xs md:text-sm text-destructive font-medium flex items-center gap-1 mt-1">⚠️ {message}</p>
}
