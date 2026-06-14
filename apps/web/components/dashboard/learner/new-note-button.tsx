'use client'

import { toast } from '@/lib/toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'

export function NewNoteButton(): React.ReactElement {
  return (
    <Button size="sm" className="text-xs" onClick={() => toast.success('New note created')}>
      <FontAwesomeIcon icon={faPlus} className="mr-1 size-3.5" />
      New note
    </Button>
  )
}
