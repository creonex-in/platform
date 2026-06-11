import type { Metadata } from 'next'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { Card, CardContent } from '@/components/ui/card'
import { NewNoteButton } from '@/components/dashboard/learner/new-note-button'
import { getLearnerNotes } from '@/dal/learner.dal'

export const metadata: Metadata = { title: 'Notes — Creonex' }

export default async function NotesPage(): Promise<React.ReactElement> {
  const notes = await getLearnerNotes()

  return (
    <>
      <DashboardTopbar title="Notes" showSearch action={<NewNoteButton />} />
      <div className="space-y-4 p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">Your notes from courses and sessions.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id} className="h-full transition-colors hover:border-primary/40">
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-medium">{note.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{note.snippet}</p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                  <span className="truncate">{note.course}</span>
                  <span className="shrink-0">{note.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
