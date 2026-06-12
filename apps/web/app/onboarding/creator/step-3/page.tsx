'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBolt, faClock, faRocket } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  InputGroup, InputGroupAddon, InputGroupText, InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

const DURATIONS = [30, 45, 60, 90] as const

const schema = z.object({
  title: z.string().min(5, 'At least 5 characters').max(80, 'Max 80 characters'),
  price: z.number({ error: 'Enter a price' }).min(299, 'Minimum ₹299'),
  duration: z.number({ error: 'Select a duration' }).min(1, 'Select a duration'),
})

type FormValues = z.infer<typeof schema>

const STORAGE_KEY = 'creonex-onboarding-step3'

export default function CreatorStep3Page() {
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', price: undefined, duration: undefined } as unknown as FormValues,
  })

  const price = watch('price')
  const duration = watch('duration')
  const title = watch('title')
  const earnings = Math.floor((price ?? 0) * 0.85)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FormValues>
        reset({
          title: parsed.title ?? '',
          price: parsed.price ?? undefined,
          duration: parsed.duration ?? undefined,
        })
      }
    } catch { /* corrupt — start fresh */ }
    setHydrated(true)
    router.prefetch('/dashboard')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ title, price, duration })) } catch { /* non-fatal */ }
  }, [title, price, duration, hydrated])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setApiError('')
    try {
      const res = await fetch('/api/v1/onboarding/creator/step-3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          offerType: 'one_on_one',
          title: data.title.trim(),
          price: data.price,
          durationMinutes: data.duration,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        setApiError(body.message ?? 'Something went wrong — please try again')
        return
      }
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* non-fatal */ }
      setLive(true)
      setTimeout(() => router.push('/dashboard'), 1400)
    } catch {
      setApiError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (live) {
    return (
      <div className="flex flex-col w-full rounded-3xl border border-border/60 bg-card shadow-xl shadow-black/[0.04] overflow-hidden py-24 px-6 items-center justify-center">
        <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FontAwesomeIcon icon={faRocket} className="size-8 text-primary" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">You&apos;re live!</h1>
          <p className="text-muted-foreground">Your first offering is published. Taking you to your dashboard…</p>
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
        <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p className="text-xs text-muted-foreground text-center tracking-wide uppercase">Step 3 of 3</p>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Create your first 1-on-1 session</h1>
            <p className="text-sm text-muted-foreground">Set your price, duration and title — editable anytime</p>
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
                  placeholder="299"
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
                    onClick={() => setValue('duration', d, { shouldValidate: true })}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-all active:scale-[0.97]',
                      duration === d
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:border-primary/50',
                    )}
                  >
                    {d} min
                  </button>
                ))}
              </div>
              {errors.duration && (
                <p className="text-xs text-destructive">{errors.duration.message}</p>
              )}
            </div>

            {apiError && (
              <p className="text-sm text-destructive animate-in fade-in duration-200">{apiError}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold text-sm shadow-lg shadow-primary/20"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faBolt} className="size-4 mr-2" />
                  Go Live
                </>
              )}
            </Button>
          </form>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push('/onboarding/creator/step-2')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="size-4 mr-1" />
            Back
          </Button>
        </div>
      </div>
    </div>
  )
}
