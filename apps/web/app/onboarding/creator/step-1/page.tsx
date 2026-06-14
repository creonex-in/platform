'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowLeft, faArrowRight, faCheck, faCircleCheck, faCircleXmark,
  faCircleNotch, faMagnifyingGlass,
  faPalette, faCircleQuestion,
  faAward, faBuilding, faWandMagicSparkles, faUsers, faGraduationCap,
  faBullseye, faLaptop, faDumbbell, faMusic, faGlobe,
  faArrowTrendUp, faChartColumn, faIndianRupeeSign, faLayerGroup, faCompass,
  faCode, faChartLine, faLanguage, faBullhorn, faLandmark, faBrain,
  faCamera, faFlask, faHouse, faPen, faRobot, faGamepad, faUtensils,
  faUserTie, faSpa, faRocket,
} from '@fortawesome/free-solid-svg-icons'
import {
  faInstagram, faYoutube,
  faWhatsapp, faTelegram,
} from '@fortawesome/free-brands-svg-icons'
import { validateUsername } from '@creonex/types'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  InputGroup, InputGroupAddon, InputGroupText, InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { creatorStep1Schema, type CreatorStep1Form } from '@/lib/onboarding-schemas'
import { useSaveCreatorStep1, useUsernameAvailability } from '@/hooks/use-onboarding'
import { isApiError } from '@/lib/api'

type FormValues = CreatorStep1Form

// ── Static data ──────────────────────────────────────────────────────────────

type Option = { value: string; label: string; description: string; icon: IconDefinition }

const NICHE_OPTIONS: Option[] = [
  { value: 'cat_mba_prep', label: 'CAT / MBA Prep', description: 'CAT, MBA entrance & B-school prep', icon: faGraduationCap },
  { value: 'coding_dsa', label: 'Coding & DSA', description: 'Programming, DSA & dev interviews', icon: faCode },
  { value: 'personal_finance', label: 'Personal Finance', description: 'Investing, budgeting & money habits', icon: faChartLine },
  { value: 'fitness_nutrition', label: 'Fitness & Nutrition', description: 'Training, diet & body transformation', icon: faDumbbell },
  { value: 'design_creative', label: 'Design & Creative', description: 'UI/UX, graphic & visual design', icon: faPalette },
  { value: 'language_learning', label: 'Language Learning', description: 'Spoken English & other languages', icon: faLanguage },
  { value: 'digital_marketing', label: 'Digital Marketing', description: 'SEO, ads, growth & social media', icon: faBullhorn },
  { value: 'music_arts', label: 'Music & Arts', description: 'Instruments, vocals & performing arts', icon: faMusic },
  { value: 'upsc_govt_exams', label: 'UPSC & Govt Exams', description: 'Civil services & government exams', icon: faLandmark },
  { value: 'mental_wellness', label: 'Mental Wellness', description: 'Mindfulness, stress & emotional health', icon: faBrain },
  { value: 'photography', label: 'Photography', description: 'Shooting, editing & visual storytelling', icon: faCamera },
  { value: 'science_research', label: 'Science & Research', description: 'Academic science & research skills', icon: faFlask },
  { value: 'real_estate', label: 'Real Estate', description: 'Property, investing & advisory', icon: faHouse },
  { value: 'writing_content', label: 'Writing & Content', description: 'Copywriting, blogging & content', icon: faPen },
  { value: 'ai_data_science', label: 'AI & Data Science', description: 'ML, data analysis & AI tools', icon: faRobot },
  { value: 'gaming_esports', label: 'Gaming & Esports', description: 'Competitive gaming & streaming', icon: faGamepad },
  { value: 'cooking_food', label: 'Cooking & Food', description: 'Recipes, techniques & culinary skills', icon: faUtensils },
  { value: 'interview_prep', label: 'Interview Prep', description: 'Resume, HR & technical interviews', icon: faUserTie },
  { value: 'ayurveda_yoga', label: 'Ayurveda & Yoga', description: 'Yoga, ayurveda & holistic health', icon: faSpa },
  { value: 'startup_product', label: 'Startup & Product', description: 'Founders, product & entrepreneurship', icon: faRocket },
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
  { name: 'primaryNiche' as const, title: 'What is your niche?', subtitle: 'What do people most often come to you for help with?', options: NICHE_OPTIONS },
  { name: 'credentialType' as const, title: 'What is your credibility?', subtitle: 'What gives you the right to teach this?', options: CREDIBILITY_OPTIONS },
  { name: 'audienceType' as const, title: 'Who is your audience?', subtitle: 'What situation are they in, what problem are they solving?', options: AUDIENCE_OPTIONS },
  { name: 'primaryPlatform' as const, title: 'Where is your audience most active?', subtitle: 'Where does your most genuine engagement happen?', options: PLATFORM_OPTIONS },
  { name: 'creatorGoal' as const, title: 'What is your goal?', subtitle: 'What does success look like on Creonex in 3 months?', options: GOAL_OPTIONS },
]

// screen → fields to validate before advancing
const SCREEN_FIELDS: Record<number, (keyof FormValues)[]> = {
  0: ['fullName', 'username'],
  1: ['primaryNiche'],
  2: ['credentialType'],
  3: ['audienceType'],
  4: ['primaryPlatform'],
  5: ['creatorGoal'],
}

const TOTAL_SCREENS = 6
const STORAGE_KEY = 'creonex-onboarding-step1'
const AUTO_ADVANCE_MS = 280

const DEFAULT_VALUES = {
  fullName: '',
  username: '',
  primaryNiche: undefined,
  credentialType: undefined,
  audienceType: undefined,
  primaryPlatform: undefined,
  creatorGoal: undefined,
} as unknown as FormValues

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreatorStep1Page() {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const { mutateAsync, isPending } = useSaveCreatorStep1()
  const [screen, setScreen] = useState(0)
  const [apiError, setApiError] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [nicheQuery, setNicheQuery] = useState('')
  const [debouncedUsername, setDebouncedUsername] = useState('')
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
    resolver: zodResolver(creatorStep1Schema),
    defaultValues: DEFAULT_VALUES,
  })

  const values = watch()
  const usernameValue = (values.username ?? '').trim()
  const usernameFormatOk = usernameValue.length > 0 && validateUsername(usernameValue) === null

  // Debounce the handle before hitting the availability endpoint
  useEffect(() => {
    const id = setTimeout(() => setDebouncedUsername(usernameValue), 350)
    return () => clearTimeout(id)
  }, [usernameValue])

  const checkEnabled = usernameFormatOk && debouncedUsername === usernameValue
  const { data: availability, isFetching: checking } = useUsernameAvailability(debouncedUsername, checkEnabled)

  // settled = the query result matches what's currently typed
  const settled = checkEnabled && !checking && availability !== undefined
  const usernameAvailable = settled && availability.available === true
  const usernameTaken = settled && availability.available === false

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
    if (session?.user?.name && !values.fullName) {
      setValue('fullName', session.user.name)
    }
  }, [session?.user?.name]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current) }, [])

  const currentQuestion = screen >= 1 ? QUESTIONS[screen - 1] : null
  const isNicheScreen = currentQuestion?.name === 'primaryNiche'

  const filteredOptions = useMemo(() => {
    if (!currentQuestion) return []
    if (!isNicheScreen || !nicheQuery.trim()) return currentQuestion.options
    const q = nicheQuery.trim().toLowerCase()
    return currentQuestion.options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.description.toLowerCase().includes(q),
    )
  }, [currentQuestion, isNicheScreen, nicheQuery])

  const handleContinue = async () => {
    if (isPending) return
    const fields = SCREEN_FIELDS[screen] ?? []
    if (fields.length > 0) {
      const valid = await trigger(fields)
      if (!valid) return
    }
    // Screen 0 also gates on live handle availability
    if (screen === 0 && !usernameAvailable) {
      if (!settled) setApiError('Checking handle availability…')
      return
    }
    setApiError('')
    if (screen < TOTAL_SCREENS - 1) {
      setScreen((s) => s + 1)
      setNicheQuery('')
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
        setNicheQuery('')
      } else {
        void handleSubmit(onSubmit)()
      }
    }, AUTO_ADVANCE_MS)
  }

  const onSubmit = async (data: FormValues) => {
    setApiError('')
    try {
      await mutateAsync({
        fullName: data.fullName.trim(),
        username: data.username.trim().toLowerCase(),
        primaryNiche: data.primaryNiche,
        credentialType: data.credentialType,
        audienceType: data.audienceType,
        primaryPlatform: data.primaryPlatform,
        creatorGoal: data.creatorGoal,
      })
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* non-fatal */ }
      router.push('/onboarding/creator/step-2')
    } catch (e) {
      setApiError(isApiError(e) ? e.message : 'Network error — please try again')
    }
  }

  const progress = ((screen + 1) / TOTAL_SCREENS) * 100

  return (
    <div className="w-full">
      {/* Mobile-only step counter (rail shows journey on desktop) */}
      <div className="mb-8 lg:hidden">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-bold uppercase tracking-widest text-primary">Step 1 · Identity</span>
          <span className="font-medium">{screen + 1} / {TOTAL_SCREENS}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div key={screen} className="animate-in fade-in slide-in-from-bottom-3 duration-300">

        {/* ── Screen 0: Name + handle ── */}
        {screen === 0 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1 ring-1 ring-primary/20">
                <FontAwesomeIcon icon={faWandMagicSparkles} className="size-7" />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Claim your profile</h1>
              <p className="text-base text-muted-foreground leading-relaxed">Your name and the link learners will visit to book you.</p>
            </div>

            <div className="space-y-6 rounded-2xl border border-border/50 bg-card/30 p-5 sm:p-6 shadow-sm">
              {/* Display name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold">Display name</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="e.g. Srikar Chebrolu"
                  autoFocus
                  className="h-10 text-sm rounded-lg bg-background shadow-sm"
                  onKeyDown={(e) => e.key === 'Enter' && void handleContinue()}
                />
                {errors.fullName && <p className="text-[13px] font-medium text-destructive">{errors.fullName.message}</p>}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">Your handle</Label>
                <InputGroup
                  className={cn(
                    'h-10 rounded-lg bg-background shadow-sm transition-all',
                    usernameTaken && 'border-destructive ring-1 ring-destructive/20',
                    usernameAvailable && 'border-green-500/50 ring-1 ring-green-500/20',
                  )}
                >
                  <InputGroupAddon>
                    <InputGroupText className="select-none pr-0 text-sm text-muted-foreground font-medium">
                      creonex.in/c/
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="username"
                    {...register('username', {
                      onChange: (e) => {
                        e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      },
                    })}
                    placeholder="your-handle"
                    className="text-sm font-semibold"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    onKeyDown={(e) => e.key === 'Enter' && void handleContinue()}
                  />
                  <InputGroupAddon align="inline-end">
                    {usernameFormatOk && checking && (
                      <FontAwesomeIcon icon={faCircleNotch} className="size-5 animate-spin text-muted-foreground" />
                    )}
                    {usernameAvailable && (
                      <FontAwesomeIcon icon={faCircleCheck} className="size-5 text-green-600 dark:text-green-500" />
                    )}
                    {usernameTaken && (
                      <FontAwesomeIcon icon={faCircleXmark} className="size-5 text-destructive" />
                    )}
                  </InputGroupAddon>
                </InputGroup>
                {errors.username ? (
                  <p className="text-[13px] font-medium text-destructive">{errors.username.message}</p>
                ) : usernameTaken ? (
                  <p className="text-[13px] font-medium text-destructive">{availability?.reason ?? 'That handle is taken'}</p>
                ) : usernameAvailable ? (
                  <p className="text-[13px] font-medium text-green-600 dark:text-green-500">@{usernameValue} is available!</p>
                ) : (
                  <p className="text-[13px] text-muted-foreground">Lowercase letters, numbers and hyphens · 3–20 characters</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Screens 1–5: Questions ── */}
        {screen >= 1 && currentQuestion && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{currentQuestion.title}</h1>
              <p className="max-w-md text-base text-muted-foreground leading-relaxed">{currentQuestion.subtitle}</p>
            </div>

            {isNicheScreen && (
              <div className="relative">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={nicheQuery}
                  onChange={(e) => setNicheQuery(e.target.value)}
                  placeholder="Search your niche…"
                  className="h-10 pl-10 text-sm rounded-lg bg-card shadow-sm"
                />
              </div>
            )}

            <div
              className={cn(
                'overflow-y-auto pr-2 pb-2',
                isNicheScreen
                  ? 'grid max-h-[50vh] grid-cols-2 gap-3 sm:grid-cols-3'
                  : 'grid max-h-[55vh] grid-cols-1 gap-3 sm:grid-cols-2',
              )}
            >
              {filteredOptions.map((opt) => {
                const selected = values[currentQuestion.name] === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => selectAndAdvance(currentQuestion.name, opt.value)}
                    disabled={isPending}
                    className={cn(
                      'group relative text-left transition-all duration-200 active:scale-[0.98] disabled:opacity-60 overflow-hidden outline-none',
                      isNicheScreen
                        ? 'flex items-center gap-3 rounded-xl border p-2 hover:shadow-sm hover:border-foreground/30'
                        : 'flex items-start sm:items-center gap-3 rounded-xl border p-3 hover:shadow-sm hover:border-foreground/30',
                      selected
                        ? 'border-foreground bg-foreground/5 ring-1 ring-foreground'
                        : 'border-border/60 bg-card hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground',
                    )}
                  >
                    {!isNicheScreen && selected && (
                      <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-foreground animate-in zoom-in duration-200 shadow-sm">
                        <FontAwesomeIcon icon={faCheck} className="size-3 text-background" />
                      </span>
                    )}
                    <div className={cn(
                      "flex shrink-0 items-center justify-center rounded-lg transition-colors relative z-10",
                      isNicheScreen ? "size-8" : "size-10",
                      selected ? "bg-foreground text-background" : "bg-muted group-hover:bg-muted-foreground/10"
                    )}>
                      <FontAwesomeIcon
                        icon={opt.icon}
                        className={cn(
                          'transition-colors',
                          isNicheScreen ? 'size-4' : 'size-5',
                          selected ? 'text-background' : 'text-muted-foreground group-hover:text-foreground',
                        )}
                      />
                    </div>
                    <div className={cn("relative z-10 min-w-0", !isNicheScreen && "pr-4")}>
                      <p className={cn('font-bold tracking-tight', isNicheScreen ? 'text-[14px] truncate' : 'text-[15px]', selected ? 'text-foreground' : 'text-foreground')}>
                        {opt.label}
                      </p>
                      {!isNicheScreen && (
                        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{opt.description}</p>
                      )}
                    </div>
                  </button>
                )
              })}
              {filteredOptions.length === 0 && (
                <p className="col-span-full py-8 text-center text-[15px] text-muted-foreground font-medium">No niche matches “{nicheQuery}”.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {apiError && (
        <p className="mt-4 text-[13px] font-medium text-destructive animate-in fade-in duration-200">{apiError}</p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          className={cn('font-semibold', screen === 0 && 'invisible')}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 size-4" />
          Back
        </Button>

        <Button type="button" onClick={() => void handleContinue()} disabled={isPending} className="font-semibold shadow-sm">
          {isPending ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <>
              {screen === TOTAL_SCREENS - 1 ? 'Continue' : 'Next'}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
