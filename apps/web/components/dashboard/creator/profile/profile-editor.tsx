'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDisplay,
  faMobileScreen,
  faPalette,
  faUser,
  faPlus,
  faPenNib,
  faImage,
  faListUl,
  faTrophy,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Creator } from '@/types/creator'
import { ProfilePreview } from './profile-preview'
import { EditProfileDialog } from './edit-profile-dialog'
import type { ProfileData, PreviewDevice } from './types'

interface ProfileEditorProps {
  creator: Creator
}

function toProfile(creator: Creator): ProfileData {
  const parts = creator.name.split(' ')
  return {
    username: creator.username,
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
    displayName: creator.name,
    headline: creator.niche,
    intro: '',
    bio: creator.bio,
    initials: creator.initials,
    tags: creator.tags,
    socials: { instagram: '', twitter: '', linkedin: '', youtube: '', website: '' },
  }
}

export function ProfileEditor({ creator }: ProfileEditorProps): React.ReactElement {
  const [profile, setProfile] = useState<ProfileData>(() => toProfile(creator))
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [editOpen, setEditOpen] = useState(false)

  const blocks: { icon: IconDefinition; label: string; onClick: () => void }[] = [
    { icon: faPalette, label: 'Theme', onClick: () => toast.info('Theme settings coming soon') },
    { icon: faUser, label: 'Edit profile', onClick: () => setEditOpen(true) },
    { icon: faPlus, label: 'Add block', onClick: () => toast.info('Add a block — coming soon') },
    { icon: faPenNib, label: 'Add text', onClick: () => toast.info('Add text — coming soon') },
    { icon: faImage, label: 'Add image', onClick: () => toast.info('Add image — coming soon') },
    { icon: faListUl, label: 'Add list', onClick: () => toast.info('Add list — coming soon') },
    { icon: faTrophy, label: 'Add highlight', onClick: () => toast.info('Add highlight — coming soon') },
  ]

  return (
    <div className="relative flex h-[calc(100svh-4rem)] flex-col">
      {/* editor toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-2.5 sm:px-6">
        {/* device toggle */}
        <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
          {(['desktop', 'mobile'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              className={cn(
                'flex h-8 items-center gap-2 rounded-full px-3.5 text-sm font-medium capitalize transition-colors',
                device === d ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FontAwesomeIcon icon={d === 'desktop' ? faDisplay : faMobileScreen} className="size-3.5" />
              {d}
            </button>
          ))}
        </div>

        {/* block tools */}
        <div className="flex items-center gap-1.5">
          {blocks.map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={b.onClick}
              title={b.label}
              aria-label={b.label}
              className={cn(
                'flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
                b.label === 'Edit profile' && 'border-primary/40 bg-primary/10 text-primary'
              )}
            >
              <FontAwesomeIcon icon={b.icon} className="size-4" />
            </button>
          ))}
        </div>

        {/* open live */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Publish your page to open the live link')}
        >
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="size-3.5" />
          Open Live Page
        </Button>
      </div>

      {/* canvas */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4 sm:p-8">
        <ProfilePreview profile={profile} device={device} onEdit={() => setEditOpen(true)} />
      </div>

      {/* floating primary action */}
      <Button
        size="lg"
        onClick={() => setEditOpen(true)}
        className="absolute bottom-6 right-6 shadow-lg"
      >
        <FontAwesomeIcon icon={faUser} className="size-4" />
        Edit Profile
      </Button>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} profile={profile} onSave={setProfile} />
    </div>
  )
}
