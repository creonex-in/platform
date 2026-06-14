'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from '@/lib/toast'

interface ToggleRow {
  id: string
  label: string
  description: string
  defaultOn: boolean
}

interface SettingsPanelProps {
  role: 'learner' | 'creator'
  name: string
  initials: string
  email: string
  bio?: string
  notifications: ToggleRow[]
}

export function SettingsPanel({
  role,
  name,
  initials,
  email,
  bio,
  notifications,
}: SettingsPanelProps): React.ReactElement {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(notifications.map((n) => [n.id, n.defaultOn]))
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-muted text-base font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="text-xs">
              Change photo
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input id="name" defaultValue={name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" defaultValue={email} />
            </div>
          </div>

          {role === 'creator' && (
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
              <Textarea id="bio" rows={3} defaultValue={bio} placeholder="Tell learners about yourself..." />
              <p className="text-xs text-muted-foreground">A strong bio boosts your profile quality signal.</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast.success('Profile updated')}>
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {notifications.map((n, i) => (
            <div key={n.id}>
              {i > 0 && <Separator className="my-1" />}
              <div className="flex items-center justify-between py-2.5">
                <div className="pr-4">
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                </div>
                <Switch
                  checked={toggles[n.id]}
                  onCheckedChange={(v) => setToggles((t) => ({ ...t, [n.id]: v }))}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-muted-foreground">Permanently remove your account and all data.</p>
          </div>
          <Button variant="destructive" size="sm" className="text-xs">
            Delete
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
