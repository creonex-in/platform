'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft, faBolt, faClock, faRocket, faVideo,
  faUserCheck, faStar,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  InputGroup, InputGroupAddon, InputGroupText, InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { creatorStep4Schema, type CreatorStep4Form } from '@/lib/onboarding-schemas'
import { useSaveCreatorStep4 } from '@/hooks/use-onboarding'
import { isApiError } from '@/lib/api'

const DURATIONS = [30, 45, 60, 90] as const

const SESSION_HIGHLIGHTS = [
  { icon: faUserCheck, text: 'Full 1-on-1 attention' },
  { icon: faStar,      text: 'Builds reviews fast' },
  { icon: faClock,     text: 'Flexible scheduling' },
]

const STORAGE_KEY = 'creonex-onboarding-step4'

export default function CreatorStep4Page() {
  const router = useRouter()
  const { mutateAsync, isPending } = useSaveCreatorStep4()
  const [apiError, setApiError] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [live, setLive] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatorStep4Form>({
    resolver: zodResolver(creatorStep4Schema),
    defaultValues: {
      offerType: 'one_on_one',
      title: '',
      price: undefined,
      durationMinutes: undefined,
    } as unknown as CreatorStep4Form,
  })

  const price = watch('price')
  const durationMinutes = watch('durationMinutes')
  const title = watch('title')
  const earnings = Math.floor((price ?? 0) * 0.85)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<CreatorStep4Form>
        reset({
          offerType: 'one_on_one',
          title: parsed.title ?? '',
          price: parsed.price ?? undefined,
          durationMinutes: parsed.durationMinutes ?? undefined,
        } as unknown as CreatorStep4Form)
      }
    } catch { /* corrupt — start fresh */ }
    setHydrated(true)
    router.prefetch('/dashboard')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ title, price, durationMinutes })) } catch { /* non-fatal */ }
  }, [title, price, durationMinutes, hydrated])

  const onSubmit = async (data: CreatorStep4Form) => {
    setApiError('')
    try {
      const res = await mutateAsync({
        offerType: 'one_on_one',
        title: data.title.trim(),
        price: data.price,
        ...(data.durationMinutes ? { durationMinutes: data.durationMinutes } : {}),
      })
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* non-fatal */ }
      setLive(true)
      setTimeout(() => router.push(res.redirectTo ?? '/dashboard'), 1600)
    } catch (e) {
      setApiError(isApiError(e) ? e.message : 'Network error — please try again')
    }
  }

  if (live) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-20">
        <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20 shadow-lg shadow-primary/20">
            <FontAwesomeIcon icon={faRocket} className="size-10 text-primary animate-bounce" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">You&apos;re live!</h1>
            <p className="text-base text-muted-foreground">Your first session is published. Taking you to your dashboard…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="space-y-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary lg:hidden">Step 4 · First offer</p>

          {/* Hero */}
          <div className="rounded-3xl bg-gradient-to-br from-foreground/5 via-foreground/[0.02] to-transparent border border-border/60 px-6 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-foreground/5 blur-3xl pointer-events-none" />
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background shadow-xl shadow-black/10 relative z-10">
              <FontAwesomeIcon icon={faVideo} className="size-7" />
            </div>
            <div className="space-y-2 relative z-10">
              <p className="font-display text-2xl font-bold tracking-tight text-foreground">1-on-1 Session</p>
              <p className="text-[15px] text-muted-foreground leading-relaxed max-w-md">
                The fastest way to earn your first ₹ and build a reputation with real reviews from your learners.
              </p>
            </div>
          </div>

          {/* Why 1:1 chips */}
          <div className="flex flex-wrap gap-3">
            {SESSION_HIGHLIGHTS.map(({ icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-[13px] font-semibold text-foreground shadow-sm"
              >
                <FontAwesomeIcon icon={icon} className="size-3.5 text-muted-foreground" />
                {text}
              </span>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">

            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title" className="text-sm font-semibold">Session title</Label>
                <span className="text-[13px] font-medium text-muted-foreground">{(title ?? '').length}/80</span>
              </div>
              <Input
                id="title"
                {...register('title')}
                placeholder="30-min CAT Quant Doubt Clearing"
                maxLength={80}
                autoFocus
                className="h-12 text-base rounded-xl bg-card shadow-sm"
              />
              {errors.title && (
                <p className="text-[13px] font-medium text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold">Price per session</Label>
              <InputGroup className="h-12 rounded-xl bg-card shadow-sm">
                <InputGroupAddon>
                  <InputGroupText className="text-base font-semibold select-none text-muted-foreground">₹</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="price"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="499"
                  min={299}
                  className="text-base font-semibold"
                />
              </InputGroup>
              {errors.price ? (
                <p className="text-[13px] font-medium text-destructive">{errors.price.message}</p>
              ) : (price ?? 0) >= 299 ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-muted/60 px-4 py-3 animate-in fade-in duration-200 border border-border/50">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
                    <FontAwesomeIcon icon={faClock} className="size-3.5" />
                    15% platform fee
                  </span>
                  <p className="text-[15px] font-bold text-green-600 dark:text-green-500">
                    You earn ₹{earnings.toLocaleString('en-IN')}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Duration</Label>
              <div className="flex gap-3 flex-wrap">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setValue('durationMinutes', d, { shouldValidate: true })}
                    className={cn(
                      'px-5 py-2.5 rounded-xl border text-sm font-bold transition-all active:scale-[0.97]',
                      durationMinutes === d
                        ? 'border-foreground bg-foreground text-background shadow-md'
                        : 'border-border/60 bg-card hover:border-foreground/30 text-muted-foreground hover:text-foreground shadow-sm',
                    )}
                  >
                    {d} min
                  </button>
                ))}
              </div>
              {errors.durationMinutes && (
                <p className="text-[13px] font-medium text-destructive">{errors.durationMinutes.message}</p>
              )}
            </div>

            {apiError && (
              <p className="text-[13px] font-medium text-destructive animate-in fade-in duration-200">{apiError}</p>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="group relative w-full h-14 font-bold text-base shadow-xl shadow-primary/25 gap-2 overflow-hidden transition-all hover:scale-[1.01] hover:shadow-primary/40 active:scale-[0.98] rounded-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                {isPending ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faBolt} className="size-5" />
                    Publish & Go Live
                  </>
                )}
              </Button>
              <p className="text-center text-xs font-medium text-muted-foreground mt-4 leading-relaxed max-w-md mx-auto">
                Editable anytime from your dashboard.<br/>More offering types unlock after you go live.
              </p>
            </div>
          </form>

          <div className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/onboarding/creator/step-3')}
              className="font-semibold"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="size-4 mr-2" />
              Back
            </Button>
          </div>
      </div>
    </div>
  )
}
