'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faSpinner,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { OnboardingProgressBar } from '@/components/onboarding/progress-bar'
import { learnerStep1Schema, type LearnerStep1Form } from '@/lib/onboarding-schemas'
import { GOAL_OPTIONS } from '@/constants/onboarding'
import { useSaveLearnerStep1 } from '@/hooks/use-onboarding'
import { cn } from '@/lib/utils'

export function LearnerStep1Form(): React.ReactElement {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const { mutateAsync, isPending } = useSaveLearnerStep1()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<LearnerStep1Form>({
    resolver: zodResolver(learnerStep1Schema),
    mode: 'onChange',
  })

  const fullName = watch('fullName')
  const canSubmit = fullName?.length >= 2 && !!selectedGoal && !isPending

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const onSubmit = async (data: LearnerStep1Form) => {
    try {
      await mutateAsync(data)
      router.push('/onboarding/learner/complete')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="w-full space-y-8 rounded-3xl border border-border/60 bg-card p-6 shadow-xl shadow-black/[0.04] duration-300 animate-in fade-in slide-in-from-bottom-2 sm:p-9">
      <OnboardingProgressBar currentStep={1} totalSteps={1} label="About you" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        <div className="space-y-3">
          <label className="font-display text-[0.9375rem] font-semibold tracking-tight">What&apos;s your name?</label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faUser}
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              {...register('fullName')}
              ref={(el) => {
                register('fullName').ref(el)
                ;(inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el
              }}
              placeholder="Your full name"
              className="h-12 pl-10"
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="font-display text-[0.9375rem] font-semibold tracking-tight">What brings you to Creonex?</label>
            <p className="text-xs text-muted-foreground">Pick your main goal</p>
          </div>
          <Controller
            name="goalType"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((opt) => {
                  const isSelected = field.value === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        field.onChange(opt.value)
                        setSelectedGoal(opt.value)
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/40',
                      )}
                    >
                      <FontAwesomeIcon
                        icon={opt.icon}
                        className={cn('size-4 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">{opt.label}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{opt.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          />
        </div>

        <Button type="submit" className="w-full gap-2" disabled={!canSubmit}>
          {isPending ? (
            <FontAwesomeIcon icon={faSpinner} className="size-4 animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faArrowRight} className="size-4" />
          )}
          {isPending ? 'Setting up your account…' : 'Get started'}
        </Button>
      </form>
    </div>
  )
}
