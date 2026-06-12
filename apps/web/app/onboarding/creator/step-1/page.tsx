'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowLeft, faArrowRight, faCheck,
  faBookOpen, faBriefcase, faHeart, faPalette, faCircleQuestion,
  faAward, faBuilding, faWandMagicSparkles, faUsers, faGraduationCap,
  faBullseye, faLaptop, faDumbbell, faMusic, faGlobe,
  faArrowTrendUp, faChartColumn, faIndianRupeeSign, faLayerGroup, faCompass,
} from '@fortawesome/free-solid-svg-icons'
import {
  faInstagram, faYoutube, faLinkedin, faXTwitter,
  faWhatsapp, faTelegram,
} from '@fortawesome/free-brands-svg-icons'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  InputGroup, InputGroupAddon, InputGroupText, InputGroupInput,
} from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ── Schema ──────────────────────────────────────────────────────────────────

const NICHE_VALUES = ['exam_prep', 'professional_skills', 'health_wellness', 'creative_skills', 'undecided'] as const
const CREDENTIAL_VALUES = ['verified_result', 'professional_exp', 'personal_transformation', 'community_teaching', 'deep_expertise'] as const
const AUDIENCE_VALUES = ['exam_aspirants', 'working_professionals', 'health_lifestyle', 'aspiring_creatives', 'undefined_audience'] as const
const PLATFORM_VALUES = ['instagram', 'whatsapp', 'telegram', 'youtube', 'multi_platform'] as const
const GOAL_VALUES = ['full_income', 'validate_grow', 'side_income', 'build_foundation', 'exploring'] as const

const schema = z.object({
  displayName: z.string().min(2, 'At least 2 characters').max(60, 'Max 60 characters'),
  socialLinks: z.object({
    instagram: z.string().max(200).optional(),
    youtube: z.string().max(200).optional(),
    linkedin: z.string().max(200).optional(),
    twitter: z.string().max(200).optional(),
    website: z.string().max(200).optional(),
  }),
  nicheCategory: z.enum(NICHE_VALUES),
  credentialType: z.enum(CREDENTIAL_VALUES),
  audienceType: z.enum(AUDIENCE_VALUES),
  primaryPlatform: z.enum(PLATFORM_VALUES),
  creatorGoal: z.enum(GOAL_VALUES),
})

type FormValues = z.infer<typeof schema>

// ── Static data ──────────────────────────────────────────────────────────────

type Option = { value: string; label: string; description: string; icon: IconDefinition }

const NICHE_OPTIONS: Option[] = [
  { value: 'exam_prep', label: 'Exam Preparation', description: 'CAT, UPSC, JEE, NEET, DSA or placements', icon: faBookOpen },
  { value: 'professional_skills', label: 'Professional Skills', description: 'Finance, marketing, design, career transitions', icon: faBriefcase },
  { value: 'health_wellness', label: 'Health & Wellness', description: 'Fitness, yoga, nutrition, self-improvement', icon: faHeart },
  { value: 'creative_skills', label: 'Creative Skills', description: 'Music, photography, cooking or art', icon: faPalette },
  { value: 'undecided', label: 'Not Sure Yet', description: "I have an audience but no clear paid offering", icon: faCircleQuestion },
]

const CREDIBILITY_OPTIONS: Option[] = [
  { value: 'verified_result', label: 'Verified Achievement', description: '99 percentile, FAANG offer, certification', icon: faAward },
  { value: 'professional_exp', label: 'Professional Experience', description: '2+ years hands-on in this field', icon: faBuilding },
  { value: 'personal_transformation', label: 'Personal Transformation', description: 'I went through what I now help others with', icon: faWandMagicSparkles },
  { value: 'community_teaching', label: 'Community Teaching', description: 'Teaching or mentoring groups for 1+ year', icon: faUsers },
  { value: 'deep_expertise', label: 'Deep Expertise', description: 'Strong education or practice, starting to share', icon: faGraduationCap },
]

const AUDIENCE_OPTIONS: Option[] = [
  { value: 'exam_aspirants', label: 'Exam Aspirants', description: 'Exam in 6–12 weeks or placement season ahead', icon: faBullseye },
  { value: 'working_professionals', label: 'Working Professionals', description: 'Upskill, career switch or manage money better', icon: faLaptop },
  { value: 'health_lifestyle', label: 'Health & Lifestyle', description: 'Getting fitter, healthier or more confident', icon: faDumbbell },
  { value: 'aspiring_creatives', label: 'Aspiring Creatives', description: 'Turning passion into a real developed skill', icon: faMusic },
  { value: 'undefined_audience', label: 'Not Clearly Defined', description: "I have followers but no identified problem yet", icon: faCircleQuestion },
]

const PLATFORM_OPTIONS: Option[] = [
  { value: 'instagram', label: 'Instagram', description: 'Real comments — people name struggles and follow up', icon: faInstagram },
  { value: 'whatsapp', label: 'WhatsApp', description: 'Status or community — people respond and share progress', icon: faWhatsapp },
  { value: 'telegram', label: 'Telegram', description: 'Group where members discuss at depth', icon: faTelegram },
  { value: 'youtube', label: 'YouTube', description: 'Comments describe what happened when they applied content', icon: faYoutube },
  { value: 'multi_platform', label: 'Multiple Platforms', description: 'Active everywhere but no strong engagement point', icon: faGlobe },
]

const GOAL_OPTIONS: Option[] = [
  { value: 'full_income', label: 'Full Income Replacement', description: '₹20,000+ per month by month 3', icon: faArrowTrendUp },
  { value: 'validate_grow', label: 'Validate & Grow', description: '15 sessions, strong reviews, understand potential', icon: faChartColumn },
  { value: 'side_income', label: 'Consistent Side Income', description: '₹8,000–15,000/month from 5–8 sessions/week', icon: faIndianRupeeSign },
  { value: 'build_foundation', label: 'Build Foundation First', description: '10+ reviews, one group session, growing waitlist', icon: faLayerGroup },
  { value: 'exploring', label: 'Just Exploring', description: 'Start small, invest more if it works', icon: faCompass },
]

const QUESTIONS = [
  { name: 'nicheCategory' as const, title: 'What is your niche?', subtitle: 'What do people most often come to you for help with?', options: NICHE_OPTIONS },
  { name: 'credentialType' as const, title: 'What is your credibility?', subtitle: 'What gives you the right to teach this?', options: CREDIBILITY_OPTIONS },
  { name: 'audienceType' as const, title: 'Who is your audience?', subtitle: 'What situation are they in, what problem are they solving?', options: AUDIENCE_OPTIONS },
  { name: 'primaryPlatform' as const, title: 'Where is your audience most active?', subtitle: 'Where does your most genuine engagement happen?', options: PLATFORM_OPTIONS },
  { name: 'creatorGoal' as const, title: 'What is your goal?', subtitle: 'What does success look like on Creonex in 3 months?', options: GOAL_OPTIONS },
]

const SOCIAL_FIELDS: {
  key: keyof FormValues['socialLinks']
  icon: IconDefinition
  label: string
  color: string
  placeholder: string
}[] = [
  { key: 'instagram', icon: faInstagram, label: 'Instagram', color: 'from-purple-500 via-pink-500 to-orange-400', placeholder: 'instagram.com/yourhandle' },
  { key: 'youtube', icon: faYoutube, label: 'YouTube', color: 'from-red-600 to-red-500', placeholder: 'youtube.com/@yourchannel' },
  { key: 'linkedin', icon: faLinkedin, label: 'LinkedIn', color: 'from-blue-700 to-blue-600', placeholder: 'linkedin.com/in/yourprofile' },
  { key: 'twitter', icon: faXTwitter, label: 'X / Twitter', color: 'from-gray-900 to-gray-800 dark:from-white dark:to-gray-200', placeholder: 'x.com/yourhandle' },
  { key: 'website', icon: faGlobe, label: 'Website', color: 'from-emerald-600 to-teal-500', placeholder: 'yourwebsite.com' },
]

// screen → fields to validate before advancing
const SCREEN_FIELDS: Record<number, (keyof FormValues)[]> = {
  0: ['displayName'],
  1: ['socialLinks'],
  2: ['nicheCategory'],
  3: ['credentialType'],
  4: ['audienceType'],
  5: ['primaryPlatform'],
  6: ['creatorGoal'],
}

const TOTAL_SCREENS = 7
const STORAGE_KEY = 'creonex-onboarding-step1'
const AUTO_ADVANCE_MS = 280

const DEFAULT_VALUES: FormValues = {
  displayName: '',
  socialLinks: { instagram: '', youtube: '', linkedin: '', twitter: '', website: '' },
  nicheCategory: undefined as unknown as typeof NICHE_VALUES[number],
  credentialType: undefined as unknown as typeof CREDENTIAL_VALUES[number],
  audienceType: undefined as unknown as typeof AUDIENCE_VALUES[number],
  primaryPlatform: undefined as unknown as typeof PLATFORM_VALUES[number],
  creatorGoal: undefined as unknown as typeof GOAL_VALUES[number],
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreatorStep1Page() {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const [screen, setScreen] = useState(0)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  })

  const values = watch()

  // Restore sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as { screen: number; values: Partial<FormValues> }
        reset({ ...DEFAULT_VALUES, ...parsed.values })
        setScreen(Math.min(Math.max(parsed.screen ?? 0, 0), TOTAL_SCREENS - 1))
      }
    } catch { /* corrupt — start fresh */ }
    setHydrated(true)
    router.prefetch('/onboarding/creator/step-2')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist on every change
  useEffect(() => {
    if (!hydrated) return
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, values })) } catch { /* non-fatal */ }
  }, [screen, values, hydrated])

  // Pre-fill name from session if blank
  useEffect(() => {
    if (session?.user?.name && !values.displayName) {
      setValue('displayName', session.user.name)
    }
  }, [session?.user?.name]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current) }, [])

  const progress = ((screen + 1) / TOTAL_SCREENS) * 100
  const currentQuestion = screen >= 2 ? QUESTIONS[screen - 2] : null

  const handleContinue = async () => {
    if (loading) return
    const fields = SCREEN_FIELDS[screen] ?? []
    if (fields.length > 0) {
      const valid = await trigger(fields)
      if (!valid) return
    }
    if (screen < TOTAL_SCREENS - 1) {
      setScreen((s) => s + 1)
    } else {
      await handleSubmit(onSubmit)()
    }
  }

  const handleBack = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    setScreen((s) => Math.max(0, s - 1))
  }

  const selectAndAdvance = (name: keyof FormValues, value: string) => {
    setValue(name, value as never, { shouldValidate: true })
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => {
      if (screen < TOTAL_SCREENS - 1) {
        setScreen((s) => s + 1)
      } else {
        void handleSubmit(onSubmit)()
      }
    }, AUTO_ADVANCE_MS)
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setApiError('')
    try {
      const socialLinks = Object.fromEntries(
        Object.entries(data.socialLinks).filter(([, v]) => (v as string | undefined)?.trim()),
      )
      const res = await fetch('/api/v1/onboarding/creator/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: data.displayName.trim(),
          nicheCategory: data.nicheCategory,
          credentialType: data.credentialType,
          audienceType: data.audienceType,
          primaryPlatform: data.primaryPlatform,
          creatorGoal: data.creatorGoal,
          ...(Object.keys(socialLinks).length > 0 ? { socialLinks } : {}),
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        setApiError(body.message ?? 'Something went wrong — please try again')
        return
      }
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* non-fatal */ }
      router.push('/onboarding/creator/step-2')
    } catch {
      setApiError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const hasSocials = Object.values(values.socialLinks ?? {}).some((v) => (v as string)?.trim())

  return (
    <div className="flex flex-col w-full rounded-3xl border border-border/60 bg-card shadow-xl shadow-black/[0.04] overflow-hidden">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex flex-col items-center px-6 py-10 sm:p-12">
        <div className="w-full max-w-2xl">
          <p className="text-xs text-muted-foreground mb-6 text-center tracking-wide uppercase">
            Step {screen + 1} of {TOTAL_SCREENS}
          </p>

          <div key={screen} className="animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* ── Screen 0: Claim your URL ── */}
            {screen === 0 && (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-semibold tracking-tight">Claim your Creonex URL</h1>
                  <p className="text-sm text-muted-foreground">This becomes your public profile link</p>
                </div>
                <div className="max-w-sm mx-auto space-y-1.5">
                  <Label htmlFor="displayName">Your name or handle</Label>
                  <InputGroup className="h-11">
                    <InputGroupAddon>
                      <InputGroupText className="text-sm text-muted-foreground select-none pr-0">
                        creonex.in/c/
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="displayName"
                      {...register('displayName')}
                      placeholder="your-name"
                      autoFocus
                      className="text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && void handleContinue()}
                    />
                  </InputGroup>
                  {errors.displayName && (
                    <p className="text-xs text-destructive">{errors.displayName.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Screen 1: Social links ── */}
            {screen === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-semibold tracking-tight">Link your social profiles</h1>
                  <p className="text-sm text-muted-foreground">
                    Optional — helps students find and trust you
                  </p>
                </div>
                <div className="space-y-3 max-w-sm mx-auto">
                  {SOCIAL_FIELDS.map((field) => (
                    <div key={field.key} className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
                          field.color,
                        )}
                      >
                        <FontAwesomeIcon
                          icon={field.icon}
                          className={cn(
                            'size-4',
                            field.key === 'twitter' ? 'text-white dark:text-gray-900' : 'text-white',
                          )}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Input
                          {...register(`socialLinks.${field.key}`)}
                          placeholder={field.placeholder}
                          className="w-full h-9 text-sm"
                        />
                        {errors.socialLinks?.[field.key] && (
                          <p className="text-xs text-destructive">{errors.socialLinks[field.key]?.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Screens 2–6: Questions ── */}
            {screen >= 2 && currentQuestion && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-semibold tracking-tight">{currentQuestion.title}</h1>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">{currentQuestion.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt) => {
                    const selected = values[currentQuestion.name] === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => selectAndAdvance(currentQuestion.name, opt.value)}
                        disabled={loading}
                        className={cn(
                          'relative text-left rounded-xl border-2 p-4 transition-all duration-150',
                          'hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5',
                          'active:scale-[0.98] disabled:opacity-60',
                          selected
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-border bg-background',
                        )}
                      >
                        {selected && (
                          <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary animate-in zoom-in duration-200">
                            <FontAwesomeIcon icon={faCheck} className="size-3 text-primary-foreground" />
                          </span>
                        )}
                        <FontAwesomeIcon
                          icon={opt.icon}
                          className={cn('size-5 mb-2 transition-colors', selected ? 'text-primary' : 'text-muted-foreground')}
                        />
                        <p className={cn('font-medium text-sm', selected ? 'text-primary' : 'text-foreground')}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {apiError && (
            <p className="text-sm text-destructive text-center mt-4 animate-in fade-in duration-200">{apiError}</p>
          )}

          <div className="flex items-center justify-between mt-8">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className={cn(screen === 0 && 'invisible')}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="size-4 mr-1" />
              Back
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => void handleContinue()}
              disabled={loading}
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  {screen === TOTAL_SCREENS - 1 ? 'Continue' : 'Next'}
                  <FontAwesomeIcon icon={faArrowRight} className="size-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
