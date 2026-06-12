'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const schema = z.object({
  bio: z
    .string()
    .min(20, 'At least 20 characters')
    .max(150, 'Max 150 characters'),
  tags: z
    .array(z.string().min(1).max(30))
    .min(1, 'Add at least one topic')
    .max(5, 'Max 5 topics'),
})

type FormValues = z.infer<typeof schema>

const STORAGE_KEY = 'creonex-onboarding-step2'

export default function CreatorStep2Page() {
  const router = useRouter()
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [hydrated, setHydrated] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { bio: '', tags: [] },
  })

  const bio = watch('bio')
  const tags = watch('tags')

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FormValues>
        reset({
          bio: parsed.bio ?? '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        })
      }
    } catch { /* corrupt — start fresh */ }
    setHydrated(true)
    router.prefetch('/onboarding/creator/step-3')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ bio, tags })) } catch { /* non-fatal */ }
  }, [bio, tags, hydrated])

  const addTag = () => {
    const tag = tagInput.trim()
    if (!tag || tags.length >= 5 || tag.length > 30 || tags.includes(tag)) return
    setValue('tags', [...tags, tag], { shouldValidate: true })
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setValue('tags', tags.filter((t) => t !== tag), { shouldValidate: true })
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setApiError('')
    try {
      const res = await fetch('/api/v1/onboarding/creator/step-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bio: data.bio, tags: data.tags }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        setApiError(body.message ?? 'Something went wrong — please try again')
        return
      }
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* non-fatal */ }
      router.push('/onboarding/creator/step-3')
    } catch {
      setApiError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full rounded-3xl border border-border/60 bg-card shadow-xl shadow-black/[0.04] overflow-hidden">
      <div className="w-full h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: '66%' }} />
      </div>

      <div className="flex flex-col items-center px-6 py-10 sm:p-12">
        <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p className="text-xs text-muted-foreground text-center tracking-wide uppercase">Step 2 of 3</p>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Tell people about yourself</h1>
            <p className="text-sm text-muted-foreground">A short bio and the topics you teach</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Bio */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio">Your bio</Label>
                <span className={cn('text-xs', bio.length > 150 ? 'text-destructive' : 'text-muted-foreground')}>
                  {bio.length} / 150
                </span>
              </div>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="I help working professionals crack CAT in 90 days with a structured, doubt-first approach..."
                rows={4}
                autoFocus
                className="resize-none text-sm"
              />
              {errors.bio ? (
                <p className="text-xs text-destructive">{errors.bio.message}</p>
              ) : bio.length > 0 && bio.length < 20 ? (
                <p className="text-xs text-muted-foreground">{20 - bio.length} more characters needed</p>
              ) : null}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>
                Teaching topics{' '}
                <span className="text-muted-foreground font-normal">(1–5)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addTag() }
                  }}
                  placeholder="e.g. CAT Quantitative"
                  maxLength={30}
                  disabled={tags.length >= 5}
                  className="flex-1 text-sm h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1.5 pl-3 pr-2 py-1 text-sm animate-in fade-in zoom-in-95 duration-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive transition-colors"
                      >
                        <FontAwesomeIcon icon={faXmark} className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {errors.tags && (
                <p className="text-xs text-destructive">{errors.tags.message}</p>
              )}
            </div>

            {apiError && (
              <p className="text-sm text-destructive animate-in fade-in duration-200">{apiError}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push('/onboarding/creator/step-1')}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="size-4 mr-1" />
                Back
              </Button>

              <Button type="submit" size="sm" disabled={loading}>
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="size-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
