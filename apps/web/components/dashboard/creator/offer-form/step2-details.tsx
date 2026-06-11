'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { OfferFormValues } from './index'

export function Step2Details(): React.ReactElement {
  const { register, formState: { errors } } = useFormContext<OfferFormValues>()

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold">Offer details</h3>
        <p className="text-sm text-muted-foreground mt-1">Give your offer a clear title and description.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">Title</Label>
        <Input
          id="title"
          placeholder="e.g. 1:1 Portfolio Review"
          {...register('title')}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <Textarea
          id="description"
          placeholder="What will learners get from this session? Be specific."
          rows={4}
          {...register('description')}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        <p className="text-xs text-muted-foreground">Good descriptions boost booking rates by 2-3x.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          placeholder="45"
          {...register('duration', { valueAsNumber: true })}
          className={errors.duration ? 'border-destructive' : ''}
        />
        {errors.duration && <p className="text-xs text-destructive">{errors.duration.message}</p>}
      </div>
    </div>
  )
}
