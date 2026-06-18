'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faNoteSticky, faTrash, faPen } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useNotes, useNoteMutations } from '@/hooks/use-learner'
import { isApiError } from '@/lib/api'
import { toast } from '@/lib/toast'
import { EmptyState, Spinner } from './shared'
import type { LearnerNote } from '@creonex/types'

export function NotesPanel({ initial }: { initial: LearnerNote[] }): React.ReactElement {
  const { data = initial } = useNotes()
  const { create, update, remove } = useNoteMutations()
  const [editing, setEditing] = useState<LearnerNote | 'new' | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  function open(note: LearnerNote | 'new'): void {
    setEditing(note)
    setTitle(note === 'new' ? '' : note.title)
    setContent(note === 'new' ? '' : note.content)
  }

  async function save(): Promise<void> {
    if (title.trim().length === 0) { toast.error('Add a title'); return }
    try {
      if (editing === 'new') await create.mutateAsync({ title, content })
      else if (editing) await update.mutateAsync({ id: editing.id, title, content })
      setEditing(null)
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not save note.')
    }
  }

  async function del(id: string): Promise<void> {
    try { await remove.mutateAsync(id) } catch { toast.error('Could not delete.') }
  }

  const saving = create.isPending || update.isPending

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="default" className="h-10 rounded-xl" onClick={() => open('new')}>
          <FontAwesomeIcon icon={faPlus} className="size-3.5 mr-1.5" /> New note
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState icon={faNoteSticky} title="No notes yet" description="Jot down takeaways from your sessions." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.map((note) => (
            <div key={note.id} className="group rounded-2xl border border-border bg-card p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.10)]">
              <div className="flex items-start justify-between gap-2">
                <p className="text-base font-semibold text-foreground">{note.title}</p>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => open(note)} className="text-muted-foreground hover:text-foreground" aria-label="Edit">
                    <FontAwesomeIcon icon={faPen} className="size-3.5" />
                  </button>
                  <button onClick={() => setConfirmId(note.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                    <FontAwesomeIcon icon={faTrash} className="size-3.5" />
                  </button>
                </div>
              </div>
              {note.content && <p className="mt-1.5 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">{note.content}</p>}
            </div>
          ))}
        </div>
      )}

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing === 'new' ? 'New note' : 'Edit note'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            <Textarea placeholder="Write your note…" rows={10} value={content} onChange={(e) => setContent(e.target.value)} maxLength={10000} />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Spinner /> : 'Save note'}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmId !== null} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the note. It can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirmId) del(confirmId); setConfirmId(null) }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
