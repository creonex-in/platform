'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateLearnerProfile } from '@/hooks/use-learner'
import { isApiError } from '@/lib/api'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { Spinner } from './shared'
import { GOAL_TYPES, NICHES, type LearnerProfile } from '@creonex/types'

const label = (s: string): string => s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
const MAX_NICHES = 5

export function AccountForm({
  profile, displayName, email,
}: {
  profile: LearnerProfile
  displayName: string
  email: string
}): React.ReactElement {
  const update = useUpdateLearnerProfile()
  const [goalType, setGoalType] = useState(profile.goalType ?? '')
  const [niches, setNiches] = useState<string[]>(profile.interestedNiches ?? [])

  function toggleNiche(n: string): void {
    setNiches((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : prev.length < MAX_NICHES ? [...prev, n] : prev,
    )
  }

  async function save(): Promise<void> {
    try {
      await update.mutateAsync({ goalType: goalType || undefined, interestedNiches: niches })
      toast.success('Saved', 'Your preferences are updated.')
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not save. Try again.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Identity (read-only) */}
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium text-foreground">{displayName}</p></div>
          <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium text-foreground">{email}</p></div>
        </div>
      </section>

      {/* Goal */}
      <section className="space-y-2.5">
        <Label htmlFor="goal">Primary goal</Label>
        <Select value={goalType || undefined} onValueChange={(v) => v && setGoalType(v)}>
          <SelectTrigger id="goal" className="h-11 w-full sm:max-w-sm"><SelectValue placeholder="Choose your goal" /></SelectTrigger>
          <SelectContent>
            {GOAL_TYPES.map((g) => <SelectItem key={g} value={g}>{label(g)}</SelectItem>)}
          </SelectContent>
        </Select>
      </section>

      {/* Interested niches */}
      <section className="space-y-2.5">
        <Label>Interested topics ({niches.length}/{MAX_NICHES})</Label>
        <div className="flex flex-wrap gap-2">
          {NICHES.map((n) => {
            const active = niches.includes(n)
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggleNiche(n)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-foreground/30',
                )}
              >
                {label(n)}
              </button>
            )
          })}
        </div>
      </section>

      <div className="flex justify-end border-t border-border pt-5">
        <Button onClick={save} disabled={update.isPending} className="h-11 rounded-lg px-6">
          {update.isPending ? <Spinner /> : <><FontAwesomeIcon icon={faCheck} className="size-4 mr-1.5" /> Save changes</>}
        </Button>
      </div>
    </div>
  )
}
