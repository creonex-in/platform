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
import { useSaveCreatorStep2, useCreatorProfile } from '@/hooks/use-onboarding'
import { isApiError } from '@/lib/api'
import { StepHeading } from '@/components/onboarding/step-heading'
import type { SocialLinks } from '@creonex/types'
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
  experienceYears?: number
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
  const photoTokenRef = useRef('')
  const submittedRef = useRef(false)
  const { mutateAsync, isPending } = useSaveCreatorStep2()
  const { data: savedProfile } = useCreatorProfile()
  const [tagInput, setTagInput] = useState('')
  const [apiError, setApiError] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [hadStoredData, setHadStoredData] = useState(false)
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
    defaultValues: { bio: '', tags: [], photoUrl: undefined, socialLinks: {}, experienceYears: undefined },
  })

  const bio = watch('bio')
  const tags = watch('tags')
  const photoUrl = watch('photoUrl')
  const socialLinks = watch('socialLinks')
  const experienceYears = watch('experienceYears')

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
          experienceYears: parsed.experienceYears,
        })
        if (parsed.deleteToken) setDeleteToken(parsed.deleteToken)
        // Only block API fallback if there's real user-entered content
        const hasMeaningful = !!(
          parsed.bio ||
          (Array.isArray(parsed.tags) && parsed.tags.length > 0) ||
          parsed.photoUrl ||
          parsed.experienceYears != null
        )
        if (hasMeaningful) setHadStoredData(true)
      }
    } catch { /* corrupt — start fresh */ }
    setHydrated(true)
    router.prefetch('/onboarding/creator/step-3')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // API fallback: populate from DB when sessionStorage was empty (e.g. coming back after submit)
  useEffect(() => {
    if (!hydrated || hadStoredData || !savedProfile) return
    reset({
      bio: savedProfile.bio ?? '',
      tags: savedProfile.tags ?? [],
      photoUrl: savedProfile.profilePhotoUrl ?? undefined,
      socialLinks: (savedProfile.socialLinks as Persisted['socialLinks']) ?? {},
      experienceYears: savedProfile.experienceYears ?? undefined,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, hadStoredData, savedProfile])

  useEffect(() => {
    if (!hydrated) return
    try {
      const persisted: Persisted = { bio, tags, photoUrl, deleteToken, socialLinks, experienceYears }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    } catch { /* non-fatal */ }
  }, [bio, tags, photoUrl, deleteToken, socialLinks, experienceYears, hydrated])

  useEffect(() => { photoTokenRef.current = deleteToken }, [deleteToken])
  useEffect(() => {
    return () => {
      if (photoTokenRef.current && !submittedRef.current) {
        void tryDeleteCloudinaryUpload(photoTokenRef.current)
      }
    }
  }, [])

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
    setApiError('')
    try {
      // Strip empty social link strings before sending
      const rawLinks = data.socialLinks ?? {}
      const socialLinks: SocialLinks = {}
      for (const [key, val] of Object.entries(rawLinks)) {
        if (val && val.trim()) (socialLinks as Record<string, string>)[key] = val.trim()
      }

      await mutateAsync({
        bio: data.bio,
        tags: data.tags,
        ...(data.photoUrl ? { photoUrl: data.photoUrl } : {}),
        ...(Object.keys(socialLinks).length > 0 ? { socialLinks } : {}),
        ...(data.experienceYears != null ? { experienceYears: data.experienceYears } : {}),
      })
      submittedRef.current = true
      setDeleteToken('')
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* non-fatal */ }
      router.push('/onboarding/creator/step-3')
    } catch (e) {
      setApiError(isApiError(e) ? e.message : 'Network error — please try again')
    }
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="space-y-8">
        <StepHeading
          stepLabel="Step 2 · Story"
          title="Tell people about yourself"
          subtitle="A short bio, the topics you teach, and where to find you"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* Profile photo */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-3xl border border-border/50 bg-card/30 p-6 shadow-sm">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="group relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border bg-background transition-all hover:border-foreground/30 hover:bg-foreground/5 disabled:pointer-events-none disabled:opacity-60 overflow-hidden shadow-sm"
                  aria-label="Upload profile photo"
                >
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt="Profile photo preview"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground transition-colors group-hover:text-foreground">
                      <FontAwesomeIcon icon={faCamera} className="size-6" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                </button>

                <div className="flex flex-col gap-2.5">
                  <div>
                    <h3 className="font-semibold text-foreground text-base">Profile Photo</h3>
                    <p className="text-[13px] text-muted-foreground mt-0.5">JPEG, PNG, or WebP · Max 5 MB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="font-medium shadow-sm"
                    >
                      {uploading ? 'Uploading…' : photoUrl ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {photoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePhoto}
                        disabled={uploading}
                        className="text-muted-foreground hover:text-destructive font-medium"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {uploadError && (
                <p className="text-[13px] font-medium text-destructive animate-in fade-in duration-200">{uploadError}</p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Section: Professional Details */}
            <div className="pt-2">
              <div className="pb-5">
                <h3 className="font-display text-xl font-bold text-foreground">Professional Details</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">What do you do and what is your expertise?</p>
              </div>

              <div className="space-y-6">
                {/* Bio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio" className="text-sm font-semibold">Your bio</Label>
                    <span className={cn('text-[13px] font-medium', bio.length > 2000 ? 'text-destructive' : 'text-muted-foreground')}>
                      {bio.length} / 2000
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    {...register('bio')}
                    placeholder="I help working professionals crack CAT in 90 days with a structured, doubt-first approach..."
                    rows={5}
                    className="resize-y text-sm rounded-lg bg-card shadow-sm"
                  />
                  {errors.bio ? (
                    <p className="text-[13px] font-medium text-destructive">{errors.bio.message}</p>
                  ) : bio.length > 0 && bio.length < 20 ? (
                    <p className="text-[13px] text-muted-foreground font-medium">{20 - bio.length} more characters needed</p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Years of experience */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="experienceYears" className="text-sm font-semibold">Years of experience</Label>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">Optional</span>
                    </div>
                    <Input
                      id="experienceYears"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={60}
                      {...register('experienceYears', {
                        setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                      })}
                      placeholder="e.g. 5"
                      className="h-10 text-sm rounded-lg bg-card shadow-sm"
                    />
                    {errors.experienceYears ? (
                      <p className="text-[13px] font-medium text-destructive">{errors.experienceYears.message}</p>
                    ) : (
                      <p className="text-[13px] text-muted-foreground">Shown as “{(experienceYears ?? 0) || 'N'}+ yrs experience”</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
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
                        className="flex-1 text-sm h-10 rounded-lg bg-card shadow-sm"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addTag}
                        disabled={!tagInput.trim() || tags.length >= 5}
                        className="h-10 font-medium shadow-sm"
                      >
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1.5 pl-3 pr-2 py-1.5 text-sm font-medium animate-in fade-in zoom-in-95 duration-200"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-destructive transition-colors ml-1"
                            >
                              <FontAwesomeIcon icon={faXmark} className="size-3.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    {errors.tags && (
                      <p className="text-[13px] font-medium text-destructive">{errors.tags.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="my-8 h-px w-full bg-border/60" />

            {/* Section: Social Links */}
            <div>
              <div className="pb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Social Links</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">Where can your audience find more of your content?</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md hidden sm:inline-block">Optional</span>
              </div>
              
              <div className="space-y-3">
                {SOCIAL_FIELDS.map(({ key, icon, label, placeholder, color }) => (
                  <div key={key} className="relative flex items-center">
                    <span
                      className="pointer-events-none absolute left-4 flex h-5 w-5 items-center justify-center"
                      style={color ? { color } : undefined}
                    >
                      <FontAwesomeIcon icon={icon} className="size-5 text-inherit" />
                    </span>
                    <Input
                      {...register(`socialLinks.${key}`)}
                      type="url"
                      placeholder={placeholder}
                      className={cn(
                        'pl-12 text-sm h-10 rounded-lg bg-card shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary/50',
                        errors.socialLinks?.[key] && 'border-destructive focus-visible:ring-destructive',
                      )}
                      aria-label={label}
                    />
                  </div>
                ))}
              </div>
              {(errors.socialLinks?.youtube ?? errors.socialLinks?.linkedin ?? errors.socialLinks?.instagram ?? errors.socialLinks?.twitter ?? errors.socialLinks?.website) && (
                <p className="text-[13px] font-medium text-destructive mt-2">Enter a valid URL (e.g. https://...)</p>
              )}
            </div>

            {apiError && (
              <p className="text-[13px] font-medium text-destructive animate-in fade-in duration-200">{apiError}</p>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/onboarding/creator/step-1')}
                className="font-semibold"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="size-4 mr-2" />
                Back
              </Button>

              <Button type="submit" disabled={isPending || uploading} className="font-semibold shadow-sm">
                {isPending ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="size-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
        </form>
      </div>
    </div>
  )
}
