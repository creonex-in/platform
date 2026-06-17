'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCheck, faTrash, faBullseye, faFlagCheckered } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGoals, useGoalMutations } from '@/hooks/use-learner'
import { isApiError } from '@/lib/api'
import { toast } from '@/lib/toast'
import { EmptyState, Spinner } from './shared'
import { cn } from '@/lib/utils'
import type { LearnerGoal } from '@creonex/types'

export function GoalsBoard({ initial }: { initial: LearnerGoal[] }): React.ReactElement {
  const { data = initial } = useGoals()
  const { create, update, remove } = useGoalMutations()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  const active = data.filter((g) => g.status === 'active')
  const done = data.filter((g) => g.status === 'done')

  async function add(): Promise<void> {
    if (title.trim().length === 0) return
    try {
      await create.mutateAsync({ title: title.trim(), targetDate: date || undefined })
      setTitle(''); setDate('')
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not add goal.')
    }
  }

  async function toggle(g: LearnerGoal): Promise<void> {
    try { await update.mutateAsync({ id: g.id, status: g.status === 'done' ? 'active' : 'done' }) }
    catch { toast.error('Could not update goal.') }
  }
  async function del(id: string): Promise<void> {
    try { await remove.mutateAsync(id) } catch { toast.error('Could not delete.') }
  }

  function Row({ g }: { g: LearnerGoal }): React.ReactElement {
    const isDone = g.status === 'done'
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <button
          onClick={() => toggle(g)}
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors',
            isDone ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent hover:border-primary',
          )}
          aria-label={isDone ? 'Mark active' : 'Mark done'}
        >
          <FontAwesomeIcon icon={faCheck} className="size-3" />
        </button>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-medium text-foreground', isDone && 'text-muted-foreground line-through')}>{g.title}</p>
          {g.targetDate && (
            <p className="text-xs text-muted-foreground">
              by {new Date(g.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <button onClick={() => del(g.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
          <FontAwesomeIcon icon={faTrash} className="size-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add goal */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Set a learning goal…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add() }}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0"
          maxLength={120}
        />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-44" />
        <Button onClick={add} disabled={create.isPending} className="rounded-lg sm:w-auto">
          {create.isPending ? <Spinner /> : <><FontAwesomeIcon icon={faPlus} className="size-3.5 mr-1.5" /> Add</>}
        </Button>
      </div>

      {active.length === 0 && done.length === 0 ? (
        <EmptyState icon={faBullseye} title="No goals yet" description="Set a goal to keep your learning focused." />
      ) : (
        <div className="space-y-5">
          {active.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active ({active.length})</p>
              <div className="space-y-2">{active.map((g) => <Row key={g.id} g={g} />)}</div>
            </div>
          )}
          {done.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed ({done.length})</p>
              <div className="space-y-2">{done.map((g) => <Row key={g.id} g={g} />)}</div>
            </div>
          )}
        </div>
      )}

      {/* Deferred features — clearly labeled placeholder */}
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground">
        <FontAwesomeIcon icon={faFlagCheckered} className="size-4 shrink-0" />
        <span>Progress tracking and certificates arrive with structured content. For now, goals keep you on track.</span>
      </div>
    </div>
  )
}
