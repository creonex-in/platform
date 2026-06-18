'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faUpload, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usersService } from '@/services/users.service'
import { learnerService } from '@/services/learner.service'
import { uploadToCloudinary, validateImageFile, tryDeleteCloudinaryUpload } from '@/lib/cloudinary'
import { isApiError } from '@/lib/api'
import { getInitials, cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { GOAL_TYPES, NICHES, type LearnerProfile } from '@creonex/types'

const label = (s: string): string => s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
const MAX_NICHES = 5

export function AccountForm({
  profile, name: initialName, email, image,
}: {
  profile: LearnerProfile
  name: string
  email: string
  image: string | null
}): React.ReactElement {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(initialName)
  const [photoUrl, setPhotoUrl] = useState(image ?? '')
  const [photoToken, setPhotoToken] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [goalType, setGoalType] = useState(profile.goalType ?? '')
  const [niches, setNiches] = useState<string[]>(profile.interestedNiches ?? [])
  const [saving, setSaving] = useState(false)

  function toggleNiche(n: string): void {
    setNiches((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length < MAX_NICHES ? [...p, n] : p))
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const err = await validateImageFile(file)
    if (err) { toast.error(err); return }
    if (photoToken) void tryDeleteCloudinaryUpload(photoToken)
    setPhotoUploading(true)
    try {
      const res = await uploadToCloudinary(file)
      setPhotoUrl(res.url)
      setPhotoToken(res.deleteToken)
    } catch (err2) {
      toast.error(err2 instanceof Error ? err2.message : 'Upload failed — try again')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function save(): Promise<void> {
    if (name.trim().length < 2) { toast.error('Enter your name'); return }
    setSaving(true)
    try {
      await Promise.all([
        usersService.updateMe({ name: name.trim(), ...(photoUrl ? { image: photoUrl } : {}) }),
        learnerService.updateProfile({ goalType: goalType || undefined, interestedNiches: niches }),
      ])
      setPhotoToken(null)
      toast.success('Profile updated', 'Your changes are saved.')
      router.refresh()
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile */}
      <section className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="space-y-1">
          <h3 className="text-base font-bold tracking-tight text-foreground">Profile</h3>
          <p className="text-xs text-muted-foreground">Your photo and name across Creonex.</p>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-20 ring-2 ring-border">
            {photoUrl ? <AvatarImage src={photoUrl} alt="" /> : null}
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
              {getInitials(name || email)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <Button type="button" variant="outline" size="sm" disabled={photoUploading} onClick={() => fileRef.current?.click()}>
              <FontAwesomeIcon icon={photoUploading ? faSpinner : faUpload} className={cn('size-3.5 mr-1.5', photoUploading && 'animate-spin')} />
              {photoUploading ? 'Uploading…' : 'Change photo'}
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG, or WebP · up to 5MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPhoto} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" className="h-11" value={email} disabled readOnly />
          </div>
        </div>
      </section>

      <Separator />

      {/* Learning preferences */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold tracking-tight text-foreground">Learning preferences</h3>
          <p className="text-xs text-muted-foreground">Helps us tailor what you see.</p>
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="goal">Primary goal</Label>
          <Select value={goalType || undefined} onValueChange={(v) => v && setGoalType(v)}>
            <SelectTrigger id="goal" className="h-11 w-full sm:max-w-sm"><SelectValue placeholder="Choose your goal" /></SelectTrigger>
            <SelectContent>
              {GOAL_TYPES.map((g) => <SelectItem key={g} value={g}>{label(g)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <Label>Interested topics ({niches.length}/{MAX_NICHES})</Label>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => {
              const active = niches.includes(n)
              return (
                <button
                  key={n} type="button" onClick={() => toggleNiche(n)}
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
        </div>
      </section>

      <div className="flex justify-end border-t border-border pt-6">
        <Button onClick={save} disabled={saving || photoUploading} className="h-11 rounded-lg px-6">
          <FontAwesomeIcon icon={saving ? faSpinner : faCheck} className={cn('size-4 mr-1.5', saving && 'animate-spin')} />
          Save changes
        </Button>
      </div>
    </div>
  )
}
