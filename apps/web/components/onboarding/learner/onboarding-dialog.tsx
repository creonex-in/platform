'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGraduationCap,
  faBriefcase,
  faBolt,
  faLaptopCode,
  faChartLine,
  faDumbbell,
  faEllipsis,
} from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'
import { isApiError } from '@/lib/api'
import { useSaveLearnerStep1 } from '@/hooks/use-onboarding'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

type GoalType = 'cat_prep' | 'job_switch' | 'skill_upgrade' | 'freelancing' | 'investing' | 'fitness' | 'other'
type Niche =
  | 'cat_mba_prep' | 'coding_dsa' | 'personal_finance' | 'fitness_nutrition'
  | 'design_creative' | 'language_learning' | 'digital_marketing' | 'music_arts'
  | 'upsc_govt_exams' | 'mental_wellness' | 'photography' | 'science_research'
  | 'real_estate' | 'writing_content' | 'ai_data_science' | 'gaming_esports'
  | 'cooking_food' | 'interview_prep' | 'ayurveda_yoga' | 'startup_product'

const GOALS: { value: GoalType; label: string; icon: typeof faGraduationCap }[] = [
  { value: 'cat_prep', label: 'CAT / MBA Prep', icon: faGraduationCap },
  { value: 'job_switch', label: 'Switch Careers', icon: faBriefcase },
  { value: 'skill_upgrade', label: 'Upgrade Skills', icon: faBolt },
  { value: 'freelancing', label: 'Start Freelancing', icon: faLaptopCode },
  { value: 'investing', label: 'Learn Investing', icon: faChartLine },
  { value: 'fitness', label: 'Fitness & Health', icon: faDumbbell },
  { value: 'other', label: 'Something Else', icon: faEllipsis },
]

const NICHES: { value: Niche; label: string }[] = [
  { value: 'cat_mba_prep', label: 'CAT / MBA' },
  { value: 'coding_dsa', label: 'Coding & DSA' },
  { value: 'personal_finance', label: 'Personal Finance' },
  { value: 'fitness_nutrition', label: 'Fitness & Nutrition' },
  { value: 'design_creative', label: 'Design & Creative' },
  { value: 'language_learning', label: 'Language Learning' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'music_arts', label: 'Music & Arts' },
  { value: 'upsc_govt_exams', label: 'UPSC / Govt Exams' },
  { value: 'mental_wellness', label: 'Mental Wellness' },
  { value: 'photography', label: 'Photography' },
  { value: 'ai_data_science', label: 'AI & Data Science' },
  { value: 'writing_content', label: 'Writing & Content' },
  { value: 'interview_prep', label: 'Interview Prep' },
  { value: 'startup_product', label: 'Startup & Product' },
  { value: 'cooking_food', label: 'Cooking & Food' },
]

interface LearnerOnboardingDialogProps {
  defaultOpen?: boolean
}

export function LearnerOnboardingDialog({ defaultOpen = false }: LearnerOnboardingDialogProps): React.ReactElement {
  const router = useRouter()
  const { mutateAsync, isPending } = useSaveLearnerStep1()
  const [open, setOpen] = useState(defaultOpen)
  const [step, setStep] = useState<1 | 2>(1)
  const [goal, setGoal] = useState<GoalType | null>(null)
  const [niches, setNiches] = useState<Niche[]>([])
  const [error, setError] = useState<string | null>(null)

  function toggleNiche(niche: Niche) {
    setNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : prev.length < 5 ? [...prev, niche] : prev,
    )
  }

  async function handleSubmit() {
    if (!goal) return
    setError(null)
    try {
      await mutateAsync({ goalType: goal, interestedNiches: niches })
      setOpen(false)
      router.refresh()
    } catch (e) {
      setError(isApiError(e) ? e.message : 'Something went wrong. Try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg gap-0 p-0 overflow-hidden"
        showCloseButton={false}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        <div className="p-6 space-y-6">
          <DialogHeader>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Step {step} of 2
            </p>
            <DialogTitle className="font-display text-xl font-bold">
              {step === 1 ? "What's your main goal?" : 'Pick your interests'}
            </DialogTitle>
            <DialogDescription>
              {step === 1
                ? 'We\'ll personalise your Creonex experience based on what you want to achieve.'
                : 'Select up to 5 topics you want to learn. You can always change these later.'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1 — Goal selection */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2.5">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(g.value)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all',
                    goal === g.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30 text-foreground'
                      : 'border-border bg-background/50 hover:border-primary/40 hover:bg-foreground/5 text-muted-foreground hover:text-foreground',
                  )}
                >
                  <FontAwesomeIcon icon={g.icon} className="size-4 shrink-0" />
                  <span className="font-medium">{g.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Niche selection */}
          {step === 2 && (
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => toggleNiche(n.value)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                    niches.includes(n.value)
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                      : 'border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                    niches.length >= 5 && !niches.includes(n.value) && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  {n.label}
                </button>
              ))}
              {niches.length > 0 && (
                <p className="w-full text-xs text-muted-foreground mt-1">
                  {niches.length}/5 selected
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            {step === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isPending}
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step === 1 ? (
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!goal}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || niches.length === 0}
                className="flex-1"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="size-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Saving…
                  </span>
                ) : (
                  "Let's go"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
