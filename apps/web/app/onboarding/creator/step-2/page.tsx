'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faArrowLeft, faArrowRight, faCamera, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { faYoutube, faLinkedin, faInstagram, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { creatorStep2Schema, type CreatorStep2Form } from '@/lib/onboarding-schemas'
import {
  validateImageFile,
  uploadToCloudinary,
  tryDeleteCloudinaryUpload,
} from '@/lib/cloudinary'

const STORAGE_KEY = 'creonex-onboarding-step2'

type Persisted = {
  bio?: string
  tags?: string[]
  photoUrl?: string
  deleteToken?: string
  socialLinks?: {
    youtube?: string
    linkedin?: string
    instagram?: string
    twitter?: string
    website?: string
  }
}

const SOCIAL_FIELDS = [
  { key: 'youtube' as const,   icon: faYoutube,  label: 'YouTube',  placeholder: 'https://youtube.com/@yourchannel',  color: '#FF0000' },
  { key: 'linkedin' as const,  icon: faLinkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourprofile', color: '#0A66C2' },
  { key: 'instagram' as const, icon: faInstagram,label: 'Instagram',placeholder: 'https://instagram.com/yourhandle',   color: '#E1306C' },
  { key: 'twitter' as const,   icon: faXTwitter, label: 'X / Twitter', placeholder: 'https://x.com/yourhandle',       color: '#000000' },
  { key: 'website' as const,   icon: faGlobe,    label: 'Website',  placeholder: 'https://yourwebsite.com',           color: undefined  },
] as const

export default function CreatorStep2Page() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [deleteToken, setDeleteToken] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatorStep2Form>({
    resolver: zodResolver(creatorStep2Schema),
    defaultValues: { bio: '', tags: [], photoUrl: undefined, socialLinks: {} },
  })

  const bio = watch('bio')
  const tags = watch('tags')
  const photoUrl = watch('photoUrl')
  const socialLinks = watch('socialLinks')

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Persisted
        reset({
          bio: parsed.bio ?? '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          photoUrl: parsed.photoUrl,
          socialLinks: parsed.socialLinks ?? {},
        })
        if (parsed.deleteToken) setDeleteToken(parsed.deleteToken)
      }
    } catch { /* corrupt — start fresh */ }
    setHydrated(true)
    router.prefetch('/onboarding/creator/step-3')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      const persisted: Persisted = { bio, tags, photoUrl, deleteToken, socialLinks }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    } catch { /* non-fatal */ }
  }, [bio, tags, photoUrl, deleteToken, socialLinks, hydrated])

  useEffect(() => {
    return () => {
      if (deleteToken) void tryDeleteCloudinaryUpload(deleteToken)
    }
  }, [deleteToken])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploadError('')
    const validationError = await validateImageFile(file)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    if (deleteToken) void tryDeleteCloudinaryUpload(deleteToken)

    setUploading(true)
    try {
      const result = await uploadToCloudinary(file)
      setValue('photoUrl', result.url, { shouldValidate: true })
      setDeleteToken(result.deleteToken)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed — please try again')
    } finally {
      setUploading(false)
    }
  }

  function handleRemovePhoto() {
    if (deleteToken) void tryDeleteCloudinaryUpload(deleteToken)
    setValue('photoUrl', undefined, { shouldValidate: false })
    setDeleteToken('')
    setUploadError('')
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (!tag || tags.length >= 5 || tag.length > 30 || tags.includes(tag)) return
    setValue('tags', [...tags, tag], { shouldValidate: true })
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setValue('tags', tags.filter((t) => t !== tag), { shouldValidate: true })
  }

  const onSubmit = async (data: CreatorStep2Form) => {
    setLoading(true)
    setApiError('')
    try {
      // Strip empty social link strings before sending
      const rawLinks = data.socialLinks ?? {}
      const socialLinksPayload: Record<string, string> = {}
      for (const [key, val] of Object.entries(rawLinks)) {
        if (val && val.trim()) socialLinksPayload[key] = val.trim()
      }

      const res = await fetch('/api/v1/onboarding/creator/step-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bio: data.bio,
          tags: data.tags,
          ...(data.photoUrl ? { photoUrl: data.photoUrl } : {}),
          ...(Object.keys(socialLinksPayload).length > 0 ? { socialLinks: socialLinksPayload } : {}),
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        setApiError(body.message ?? 'Something went wrong — please try again')
        return
      }
      setDeleteToken('')
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* non-fatal */ }
      router.push('/onboarding/creator/step-3')
    } catch {
      setApiError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full rounded-3xl border border-border/60 bg-card shadow-xl shadow-black/[0.04] overflow-hidden">
      <div className="w-full h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: '50%' }} />
      </div>

      <div className="flex flex-col items-center px-6 py-10 sm:p-12">
        <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p className="text-xs text-muted-foreground text-center tracking-wide uppercase">Step 2 of 4</p>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Tell people about yourself</h1>
            <p className="text-sm text-muted-foreground">A short bio, the topics you teach, and where to find you</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Profile photo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Profile photo</Label>
                <span className="text-xs text-muted-foreground">Optional</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted transition-colors hover:border-primary hover:bg-muted/80 disabled:pointer-events-none disabled:opacity-60 overflow-hidden"
                  aria-label="Upload profile photo"
                >
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt="Profile photo preview"
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faCamera} className="size-5 text-muted-foreground" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                </button>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading…' : photoUrl ? 'Replace photo' : 'Upload photo'}
                  </Button>
                  {photoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      disabled={uploading}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {uploadError && (
                <p className="text-xs text-destructive animate-in fade-in duration-200">{uploadError}</p>
              )}
              <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP · Max 5 MB · At least 200×200 px</p>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio">Your bio</Label>
                <span className={cn('text-xs', bio.length > 150 ? 'text-destructive' : 'text-muted-foreground')}>
                  {bio.length} / 150
                </span>
              </div>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="I help working professionals crack CAT in 90 days with a structured, doubt-first approach..."
                rows={4}
                className="resize-none text-sm"
              />
              {errors.bio ? (
                <p className="text-xs text-destructive">{errors.bio.message}</p>
              ) : bio.length > 0 && bio.length < 20 ? (
                <p className="text-xs text-muted-foreground">{20 - bio.length} more characters needed</p>
              ) : null}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>
                Teaching topics{' '}
                <span className="text-muted-foreground font-normal">(1–5)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addTag() }
                  }}
                  placeholder="e.g. CAT Quantitative"
                  maxLength={30}
                  disabled={tags.length >= 5}
                  className="flex-1 text-sm h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1.5 pl-3 pr-2 py-1 text-sm animate-in fade-in zoom-in-95 duration-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive transition-colors"
                      >
                        <FontAwesomeIcon icon={faXmark} className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {errors.tags && (
                <p className="text-xs text-destructive">{errors.tags.message}</p>
              )}
            </div>

            {/* Social links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Social links</Label>
                <span className="text-xs text-muted-foreground">Optional</span>
              </div>
              <div className="space-y-2">
                {SOCIAL_FIELDS.map(({ key, icon, label, placeholder, color }) => (
                  <div key={key} className="relative flex items-center">
                    <span
                      className="pointer-events-none absolute left-3 flex h-4 w-4 items-center justify-center"
                      style={color ? { color } : undefined}
                    >
                      <FontAwesomeIcon icon={icon} className="size-4 text-inherit" />
                    </span>
                    <Input
                      {...register(`socialLinks.${key}`)}
                      type="url"
                      placeholder={placeholder}
                      className={cn(
                        'pl-9 text-sm h-9',
                        errors.socialLinks?.[key] && 'border-destructive focus-visible:ring-destructive/30',
                      )}
                      aria-label={label}
                    />
                  </div>
                ))}
              </div>
              {(errors.socialLinks?.youtube ?? errors.socialLinks?.linkedin ?? errors.socialLinks?.instagram ?? errors.socialLinks?.twitter ?? errors.socialLinks?.website) && (
                <p className="text-xs text-destructive">Enter a valid URL (e.g. https://...)</p>
              )}
            </div>

            {apiError && (
              <p className="text-sm text-destructive animate-in fade-in duration-200">{apiError}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push('/onboarding/creator/step-1')}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="size-4 mr-1" />
                Back
              </Button>

              <Button type="submit" size="sm" disabled={loading || uploading}>
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="size-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
