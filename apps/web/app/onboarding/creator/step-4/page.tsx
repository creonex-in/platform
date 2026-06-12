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

const DURATIONS = [30, 45, 60, 90] as const

const SESSION_HIGHLIGHTS = [
  { icon: faUserCheck, text: 'Full 1-on-1 attention' },
  { icon: faStar,      text: 'Builds reviews fast' },
  { icon: faClock,     text: 'Flexible scheduling' },
]

const STORAGE_KEY = 'creonex-onboarding-step4'

export default function CreatorStep4Page() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    setLoading(true)
    setApiError('')
    try {
      const res = await fetch('/api/v1/onboarding/creator/step-4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          offerType: 'one_on_one',
          title: data.title.trim(),
          price: data.price,
          ...(data.durationMinutes ? { durationMinutes: data.durationMinutes } : {}),
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        setApiError(body.message ?? 'Something went wrong — please try again')
        return
      }
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* non-fatal */ }
      setLive(true)
      setTimeout(() => router.push('/dashboard'), 1600)
    } catch {
      setApiError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (live) {
    return (
      <div className="flex flex-col w-full rounded-3xl border border-border/60 bg-card shadow-xl shadow-black/[0.04] overflow-hidden py-24 px-6 items-center justify-center">
        <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
            <FontAwesomeIcon icon={faRocket} className="size-9 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">You&apos;re live!</h1>
            <p className="text-muted-foreground">Your first session is published. Taking you to your dashboard…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full rounded-3xl border border-border/60 bg-card shadow-xl shadow-black/[0.04] overflow-hidden">
      <div className="w-full h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: '100%' }} />
      </div>

      <div className="flex flex-col items-center px-6 py-10 sm:p-12">
        <div className="w-full max-w-lg space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p className="text-xs text-muted-foreground text-center tracking-wide uppercase">Step 4 of 4 · The finale</p>

          {/* Hero */}
          <div className="rounded-2xl bg-primary/5 border border-primary/10 px-6 py-5 flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <FontAwesomeIcon icon={faVideo} className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm">1-on-1 Session</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The fastest way to earn your first ₹ and get real reviews
              </p>
            </div>
          </div>

          {/* Why 1:1 chips */}
          <div className="flex flex-wrap gap-2">
            {SESSION_HIGHLIGHTS.map(({ icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground"
              >
                <FontAwesomeIcon icon={icon} className="size-3 text-primary" />
                {text}
              </span>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Session title</Label>
                <span className="text-xs text-muted-foreground">{(title ?? '').length}/80</span>
              </div>
              <Input
                id="title"
                {...register('title')}
                placeholder="30-min CAT Quant Doubt Clearing"
                maxLength={80}
                autoFocus
                className="h-10 text-sm"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="price">Price per session</Label>
              <InputGroup className="h-10">
                <InputGroupAddon>
                  <InputGroupText className="text-sm font-medium select-none">₹</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="price"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="499"
                  min={299}
                  className="text-sm"
                />
              </InputGroup>
              {errors.price ? (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              ) : (price ?? 0) >= 299 ? (
                <div className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-2.5 animate-in fade-in duration-200">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FontAwesomeIcon icon={faClock} className="size-3.5" />
                    15% platform fee
                  </span>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    You earn ₹{earnings.toLocaleString('en-IN')}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex gap-2 flex-wrap">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setValue('durationMinutes', d, { shouldValidate: true })}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-all active:scale-[0.97]',
                      durationMinutes === d
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:border-primary/50',
                    )}
                  >
                    {d} min
                  </button>
                ))}
              </div>
              {errors.durationMinutes && (
                <p className="text-xs text-destructive">{errors.durationMinutes.message}</p>
              )}
            </div>

            {apiError && (
              <p className="text-sm text-destructive animate-in fade-in duration-200">{apiError}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold text-sm shadow-lg shadow-primary/20 gap-2"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faBolt} className="size-4" />
                  Go Live
                </>
              )}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              Editable anytime from your dashboard · More offering types unlock after you go live
            </p>
          </form>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push('/onboarding/creator/step-3')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="size-4 mr-1" />
            Back
          </Button>
        </div>
      </div>
    </div>
  )
}
