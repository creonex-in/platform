'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OfferFormValues } from './index'

const suggestedPrices = [199, 299, 499, 799, 999, 1499]

export function Step3Pricing(): React.ReactElement {
  const { register, setValue, watch, formState: { errors } } = useFormContext<OfferFormValues>()
  const price = watch('price')

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold">Set your price</h3>
        <p className="text-sm text-muted-foreground mt-1">Platform fee: 10%. You keep 90%.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price" className="text-sm font-medium">Price (₹)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
          <Input
            id="price"
            type="number"
            placeholder="499"
            className={`pl-7 ${errors.price ? 'border-destructive' : ''}`}
            {...register('price', { valueAsNumber: true })}
          />
        </div>
        {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Suggested prices</p>
        <div className="flex flex-wrap gap-2">
          {suggestedPrices.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setValue('price', p)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                price === p
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground hover:border-foreground/30'
              }`}
            >
              ₹{p}
            </button>
          ))}
        </div>
      </div>

      {price > 0 && (
        <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your price</span>
            <span>₹{price.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform fee (10%)</span>
            <span>−₹{(price * 0.1).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-medium pt-1 border-t border-border">
            <span>You receive</span>
            <span className="text-foreground">₹{(price * 0.9).toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
