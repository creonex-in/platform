'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faLock, faShieldHalved } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { payoutsService } from '@/services/payouts.service'
import { isApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { PAYOUT_ENTITY_TYPES, type KycStatusResponse } from '@creonex/types'

const ENTITY_LABELS: Record<(typeof PAYOUT_ENTITY_TYPES)[number], string> = {
  individual: 'Individual',
  proprietorship: 'Proprietorship',
  partnership: 'Partnership',
  private_limited: 'Private Limited',
  llp: 'LLP',
}

const kycSchema = z.object({
  legalName: z.string().min(2, 'Enter the legal name').max(120),
  entityType: z.enum(PAYOUT_ENTITY_TYPES, { message: 'Select an entity type' }),
  phone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid 10-digit phone'),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN (e.g. ABCDE1234F)'),
  bankAccountNumber: z.string().min(6, 'Enter account number').max(20),
  bankIfsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC (e.g. HDFC0001234)'),
  accountHolderName: z.string().min(2, 'Enter account holder name').max(120),
})

type KycFormValues = z.infer<typeof kycSchema>

export function KycForm({ initial }: { initial: KycStatusResponse }): React.ReactElement {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const {
    control, register, handleSubmit, formState: { errors },
  } = useForm<KycFormValues>({
    resolver: zodResolver(kycSchema),
    mode: 'onChange',
    defaultValues: {
      legalName: initial.account?.legalName ?? '',
      entityType: initial.account?.entityType ?? 'individual',
      phone: '',
      pan: '',
      bankAccountNumber: '',
      bankIfsc: initial.account?.bankIfsc ?? '',
      accountHolderName: initial.account?.accountHolderName ?? '',
    },
  })

  async function onSubmit(data: KycFormValues): Promise<void> {
    setSubmitting(true)
    try {
      await payoutsService.submitKyc({
        ...data,
        pan: data.pan.toUpperCase(),
        bankIfsc: data.bankIfsc.toUpperCase(),
      })
      toast.success('KYC submitted', 'We’ll verify your details and enable payouts.')
      router.push('/payouts')
      router.refresh()
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not submit KYC. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <FontAwesomeIcon icon={faShieldHalved} className="size-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your details create a verified payout account with our payment partner (Razorpay). Bank
          and PAN data are encrypted and never shown on your public profile.
        </p>
      </div>

      <Field label="Legal name" htmlFor="legalName" error={errors.legalName?.message}>
        <Input id="legalName" className="h-11" placeholder="As per PAN" {...register('legalName')} />
      </Field>

      <Field label="Entity type" htmlFor="entityType" error={errors.entityType?.message}>
        <Controller
          control={control}
          name="entityType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="entityType" className="!h-11 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYOUT_ENTITY_TYPES.map((e) => (
                  <SelectItem key={e} value={e}>{ENTITY_LABELS[e]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
        <Input id="phone" className="h-11" type="tel" inputMode="numeric" placeholder="9876543210" {...register('phone')} />
      </Field>

      <Field label="PAN" htmlFor="pan" error={errors.pan?.message}>
        <Input id="pan" className="h-11 uppercase" placeholder="ABCDE1234F" maxLength={10} {...register('pan')} />
      </Field>

      <div className="h-px bg-border" />

      <Field label="Bank account number" htmlFor="bankAccountNumber" error={errors.bankAccountNumber?.message}>
        <Input id="bankAccountNumber" className="h-11" inputMode="numeric" {...register('bankAccountNumber')} />
      </Field>

      <Field label="IFSC" htmlFor="bankIfsc" error={errors.bankIfsc?.message}>
        <Input id="bankIfsc" className="h-11 uppercase" placeholder="HDFC0001234" maxLength={11} {...register('bankIfsc')} />
      </Field>

      <Field label="Account holder name" htmlFor="accountHolderName" error={errors.accountHolderName?.message}>
        <Input id="accountHolderName" className="h-11" {...register('accountHolderName')} />
      </Field>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="outline" disabled={submitting} onClick={() => router.push('/payouts')}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          <FontAwesomeIcon icon={submitting ? faSpinner : faLock} className={cn('size-3.5 mr-1.5', submitting && 'animate-spin')} />
          {submitting ? 'Submitting…' : 'Submit for verification'}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, htmlFor, error, children }: {
  label: string; htmlFor: string; error?: string; children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-semibold">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
