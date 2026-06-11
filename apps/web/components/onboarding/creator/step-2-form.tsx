'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowRight,
  faSpinner,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OnboardingProgressBar } from '@/components/onboarding/progress-bar'
import { creatorStep2Schema, type CreatorStep2Form } from '@/lib/onboarding-schemas'
import {
  NICHE_TAG_SUGGESTIONS,
  BIO_MAX_LENGTH,
  TAGS_MAX,
  NICHE_OPTIONS,
} from '@/constants/onboarding'
import { useSaveCreatorStep2 } from '@/hooks/use-onboarding'
import type { NicheValue } from '@/types/api'
import { cn } from '@/lib/utils'

export function CreatorStep2Form(): React.ReactElement {
  const router = useRouter()
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const { mutateAsync, isPending } = useSaveCreatorStep2()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatorStep2Form>({
    resolver: zodResolver(creatorStep2Schema),
    defaultValues: { bio: '', tags: [] },
    mode: 'onChange',
  })

  const bio = watch('bio')
  const bioLen = bio?.length ?? 0
  const canSubmit = bioLen >= 20 && tags.length >= 1 && !isPending

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('creonex_ob_step1')
      if (!raw) return
      const { primaryNiche, experienceYears } = JSON.parse(raw) as {
        primaryNiche: NicheValue
        experienceYears: number
        fullName: string
      }
      const nicheLabel = NICHE_OPTIONS.find((n) => n.value === primaryNiche)?.label ?? primaryNiche
      const generatedBio = `${nicheLabel} mentor with ${experienceYears}+ years of experience.`
      setValue('bio', generatedBio)
    } catch {
      // sessionStorage unavailable — leave bio empty
    }
  }, [setValue])

  const getNicheSuggestions = (): string[] => {
    try {
      const raw = sessionStorage.getItem('creonex_ob_step1')
      if (!raw) return []
      const { primaryNiche } = JSON.parse(raw) as { primaryNiche: NicheValue }
      return NICHE_TAG_SUGGESTIONS[primaryNiche] ?? []
    } catch {
      return []
    }
  }

  const addTag = (tag: string) => {
    const t = tag.trim()
    if (!t || tags.includes(t) || tags.length >= TAGS_MAX) return
    const next = [...tags, t]
    setTags(next)
    setValue('tags', next)
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag)
    setTags(next)
    setValue('tags', next)
  }

  const onSubmit = async (data: CreatorStep2Form) => {
    try {
      await mutateAsync({ ...data, tags })
      router.push('/onboarding/creator/step-3')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  const suggestions = getNicheSuggestions()

  return (
    <div className="w-full space-y-8 rounded-3xl border border-border/60 bg-card p-6 shadow-xl shadow-black/[0.04] duration-300 animate-in fade-in slide-in-from-bottom-2 sm:p-9">
      <OnboardingProgressBar currentStep={2} totalSteps={3} label="Your profile" />

      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
        Back
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        {/* Bio */}
        <div className="space-y-3">
          <label className="font-display text-[0.9375rem] font-semibold tracking-tight">Tell learners about yourself</label>
          <p className="text-xs text-muted-foreground">We&apos;ve given you a head start — edit it to feel like you</p>
          <Textarea
            {...register('bio')}
            rows={3}
            maxLength={BIO_MAX_LENGTH}
            placeholder="Short bio (20–150 characters)"
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setValue('bio', '')}
              className="text-[11px] text-muted-foreground underline"
            >
              Clear and write my own
            </button>
            <span
              className={cn(
                'text-[11px] tabular-nums',
                bioLen >= BIO_MAX_LENGTH - 10 ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {bioLen} / {BIO_MAX_LENGTH}
            </span>
          </div>
          {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="font-display text-[0.9375rem] font-semibold tracking-tight">What specific topics do you teach?</label>
            <p className="text-xs text-muted-foreground">Up to 5 tags — e.g. Figma, LeetCode, Quant</p>
          </div>

          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) }
              }}
              placeholder="Add a tag"
              className="h-12 flex-1"
              maxLength={30}
            />
            <Button type="button" variant="outline" onClick={() => addTag(tagInput)} className="h-12 px-5">
              Add
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1.5 pr-1.5">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100">
                    <FontAwesomeIcon icon={faXmark} className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {suggestions.length > 0 && tags.length < TAGS_MAX && (
            <div className="flex flex-wrap gap-1.5">
              {suggestions
                .filter((s) => !tags.includes(s))
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addTag(s)}
                    className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
            </div>
          )}

          {errors.tags && <p className="text-xs text-destructive">{errors.tags.message}</p>}
        </div>

        <Button type="submit" className="w-full gap-2" disabled={!canSubmit}>
          {isPending ? (
            <FontAwesomeIcon icon={faSpinner} className="size-4 animate-spin" />
          ) : null}
          Continue
          {!isPending && <FontAwesomeIcon icon={faArrowRight} className="size-4" />}
        </Button>
      </form>
    </div>
  )
}
