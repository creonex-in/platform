'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faCheck } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Step1Type } from './step1-type'
import { Step2Details } from './step2-details'
import { Step3Pricing } from './step3-pricing'
import { Step4Review } from './step4-review'
import type { OfferDisplayType as OfferType } from '@/types/offer'
import { toast } from 'sonner'

const offerSchema = z.object({
  type: z.enum(['one_on_one', 'workshop', 'group', 'digital', 'community', 'coaching_plan'] as const),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  duration: z.number().min(1, 'Duration required'),
  price: z.number().min(1, 'Price required'),
})

export type OfferFormValues = z.infer<typeof offerSchema>

const STEPS = ['Type', 'Details', 'Pricing', 'Review']

export function OfferForm(): React.ReactElement {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const methods = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: { type: undefined as unknown as OfferType, title: '', description: '', duration: 45, price: 0 },
    mode: 'onChange',
  })

  const { watch, handleSubmit } = methods
  const type = watch('type')

  function goNext() {
    setDirection(1)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function goPrev() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  function onSubmit(data: OfferFormValues) {
    console.log('New offer:', data)
    toast.success('Offer published!', { description: `"${data.title}" is now live.` })
  }

  const canProceed = [
    !!type,
    true,
    true,
    true,
  ][step]

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`size-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-colors ${
                i < step ? 'bg-primary text-primary-foreground' :
                i === step ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <FontAwesomeIcon icon={faCheck} className="size-3" /> : i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 24 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {step === 0 && (
                <Step1Type
                  value={type ?? ''}
                  onChange={(t) => methods.setValue('type', t)}
                />
              )}
              {step === 1 && <Step2Details />}
              {step === 2 && <Step3Pricing />}
              {step === 3 && <Step4Review />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={goPrev} disabled={step === 0}>
            <FontAwesomeIcon icon={faChevronLeft} className="size-3.5 mr-1" />
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext} disabled={!canProceed}>
              Next
              <FontAwesomeIcon icon={faChevronRight} className="size-3.5 ml-1" />
            </Button>
          ) : (
            <Button type="submit">
              <FontAwesomeIcon icon={faCheck} className="size-3.5 mr-1" />
              Publish offer
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
