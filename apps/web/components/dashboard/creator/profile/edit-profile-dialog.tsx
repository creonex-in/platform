'use client'

import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faXmark, faPlus } from '@fortawesome/free-solid-svg-icons'
import {
  faInstagram,
  faXTwitter,
  faLinkedinIn,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/lib/toast'
import type { ProfileData, ProfileSocials } from './types'

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: ProfileData
  onSave: (next: ProfileData) => void
}

const socialFields: { key: keyof ProfileSocials; label: string; icon: IconDefinition; prefix: string }[] = [
  { key: 'instagram', label: 'Instagram', icon: faInstagram, prefix: 'instagram.com/' },
  { key: 'twitter', label: 'X (Twitter)', icon: faXTwitter, prefix: 'x.com/' },
  { key: 'linkedin', label: 'LinkedIn', icon: faLinkedinIn, prefix: 'linkedin.com/in/' },
  { key: 'youtube', label: 'YouTube', icon: faYoutube, prefix: 'youtube.com/@' },
  { key: 'website', label: 'Website', icon: faGlobe, prefix: 'https://' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <section className="space-y-4">
      <p className="text-label text-muted-foreground">{title}</p>
      {children}
    </section>
  )
}

export function EditProfileDialog({ open, onOpenChange, profile, onSave }: EditProfileDialogProps): React.ReactElement {
  const [draft, setDraft] = useState<ProfileData>(profile)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (open) setDraft(profile)
  }, [open, profile])

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]): void {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function setSocial(key: keyof ProfileSocials, value: string): void {
    setDraft((d) => ({ ...d, socials: { ...d.socials, [key]: value } }))
  }

  function addTag(): void {
    const t = tagInput.trim()
    if (t && !draft.tags.includes(t)) set('tags', [...draft.tags, t])
    setTagInput('')
  }

  function save(): void {
    const displayName = draft.displayName.trim() || `${draft.firstName} ${draft.lastName}`.trim()
    onSave({ ...draft, displayName })
    toast.success('Profile updated')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {/* header */}
        <div className="flex items-center gap-4 border-b border-border px-6 py-5">
          <Avatar className="size-14 shrink-0 ring-2 ring-border">
            <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
              {draft.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <DialogTitle className="font-display text-xl font-semibold tracking-tight">Edit Profile</DialogTitle>
            <DialogDescription>Changes preview live on your page.</DialogDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => toast.info('Photo upload coming soon')}
          >
            <FontAwesomeIcon icon={faUpload} className="size-3.5" />
            <span className="hidden sm:inline">Change photo</span>
          </Button>
        </div>

        {/* scrollable body */}
        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
          <Section title="Basics">
            <div className="space-y-2">
              <Label htmlFor="username">Your page link</Label>
              <div className="flex h-10 items-center rounded-lg border border-input bg-card pl-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                <span className="text-sm text-muted-foreground">creonex.in/</span>
                <Input
                  id="username"
                  value={draft.username}
                  onChange={(e) => set('username', e.target.value)}
                  className="h-10 border-0 pl-0.5 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first">First name</Label>
                <Input id="first" className="h-10" value={draft.firstName} onChange={(e) => set('firstName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last">Last name</Label>
                <Input id="last" className="h-10" value={draft.lastName} onChange={(e) => set('lastName', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display">Display name</Label>
              <Input id="display" className="h-10" value={draft.displayName} onChange={(e) => set('displayName', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                className="h-10"
                value={draft.headline}
                onChange={(e) => set('headline', e.target.value)}
                placeholder="e.g. UI/UX Design Mentor"
              />
            </div>
          </Section>

          <Separator />

          <Section title="About you">
            <div className="space-y-2">
              <Label htmlFor="intro">Intro</Label>
              <Input
                id="intro"
                className="h-10"
                value={draft.intro}
                onChange={(e) => set('intro', e.target.value)}
                placeholder="The first thing people will see"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About yourself</Label>
              <Textarea
                id="bio"
                rows={4}
                value={draft.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Tell learners about your experience and how you help."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Expertise</Label>
              {draft.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {draft.tags.map((t) => (
                    <Badge key={t} className="gap-1.5 bg-primary/10 py-1 pl-3 pr-1.5 text-primary">
                      {t}
                      <button
                        type="button"
                        onClick={() => set('tags', draft.tags.filter((x) => x !== t))}
                        className="flex size-4 items-center justify-center rounded-full transition-colors hover:bg-primary/20"
                        aria-label={`Remove ${t}`}
                      >
                        <FontAwesomeIcon icon={faXmark} className="size-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  id="tags"
                  className="h-10"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Add a skill and press Enter"
                />
                <Button variant="outline" size="icon" className="size-10 shrink-0" onClick={addTag} aria-label="Add skill">
                  <FontAwesomeIcon icon={faPlus} className="size-4" />
                </Button>
              </div>
            </div>
          </Section>

          <Separator />

          <Section title="Social links">
            {socialFields.map((s) => (
              <div
                key={s.key}
                className="flex h-10 items-center rounded-lg border border-input bg-card pl-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
              >
                <FontAwesomeIcon icon={s.icon} className="size-4 shrink-0 text-muted-foreground" />
                <span className="ml-2 shrink-0 text-sm text-muted-foreground">{s.prefix}</span>
                <Input
                  value={draft.socials[s.key]}
                  onChange={(e) => setSocial(s.key, e.target.value)}
                  className="h-10 border-0 pl-0.5 focus-visible:ring-0"
                  placeholder="username"
                />
              </div>
            ))}
          </Section>
        </div>

        {/* sticky footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} className="min-w-28">
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
