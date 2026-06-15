'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUpload, faXmark, faPlus, faCheck, faSpinner, faImage, faCircleCheck, faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'
import { faInstagram, faXTwitter, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { BannerPickerDialog } from '@/components/onboarding/creator/banner-picker-dialog'
import { ProfileLivePreview } from './profile-live-preview'
import { uploadToCloudinary, validateImageFile, tryDeleteCloudinaryUpload } from '@/lib/cloudinary'
import { editProfileSchema, type EditProfileForm } from '@/lib/profile-schemas'
import { useUpdateCreatorProfile } from '@/hooks/use-profile'
import { useUsernameAvailability } from '@/hooks/use-onboarding'
import { isApiError } from '@/lib/api'
import { getInitials, cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { NICHES, validateUsername, type CreatorProfile, type UpdateCreatorProfileRequest } from '@creonex/types'

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Marathi',
  'Bengali', 'Kannada', 'Malayalam', 'Punjabi', 'Gujarati', 'Urdu', 'Odia',
]

const SOCIAL_FIELDS: { key: keyof EditProfileForm['socialLinks']; label: string; icon: IconDefinition; placeholder: string }[] = [
  { key: 'instagram', label: 'Instagram', icon: faInstagram, placeholder: 'https://instagram.com/you' },
  { key: 'twitter', label: 'X (Twitter)', icon: faXTwitter, placeholder: 'https://x.com/you' },
  { key: 'linkedin', label: 'LinkedIn', icon: faLinkedinIn, placeholder: 'https://linkedin.com/in/you' },
  { key: 'youtube', label: 'YouTube', icon: faYoutube, placeholder: 'https://youtube.com/@you' },
  { key: 'website', label: 'Website', icon: faGlobe, placeholder: 'https://yoursite.com' },
]

const SECTIONS = [
  { id: 'identity', label: 'Identity' },
  { id: 'media', label: 'Photo & Banner' },
  { id: 'about', label: 'About' },
  { id: 'languages', label: 'Languages' },
  { id: 'socials', label: 'Social Links' },
]

const formatNiche = (n: string): string => n.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

interface EditProfileFormProps {
  profile: CreatorProfile
}

export function EditProfileForm({ profile }: EditProfileFormProps): React.ReactElement {
  const router = useRouter()
  const update = useUpdateCreatorProfile()
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoToken, setPhotoToken] = useState<string | null>(null)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [focusedSocial, setFocusedSocial] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('identity')
  // Preview targets the saved public page; bump to reload the iframe after a save.
  const [previewUsername, setPreviewUsername] = useState(profile.username ?? null)
  const [previewReloadKey, setPreviewReloadKey] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    mode: 'onChange',
    defaultValues: {
      displayName: profile.displayName ?? '',
      username: profile.username ?? '',
      bio: profile.bio ?? '',
      primaryNiche: (profile.primaryNiche as EditProfileForm['primaryNiche']) ?? NICHES[0],
      experienceYears: profile.experienceYears ?? undefined,
      photoUrl: profile.profilePhotoUrl ?? '',
      bannerUrl: profile.coverBannerUrl ?? undefined,
      socialLinks: {
        youtube: profile.socialLinks?.youtube ?? '',
        linkedin: profile.socialLinks?.linkedin ?? '',
        instagram: profile.socialLinks?.instagram ?? '',
        twitter: profile.socialLinks?.twitter ?? '',
        website: profile.socialLinks?.website ?? '',
      },
      languages: profile.languages?.length ? profile.languages : ['English'],
      tags: profile.tags ?? [],
    },
  })

  const values = watch()

  // Keep form in sync when server component passes down fresh profile
  useEffect(() => {
    reset({
      displayName: profile.displayName ?? '',
      username: profile.username ?? '',
      bio: profile.bio ?? '',
      primaryNiche: (profile.primaryNiche as EditProfileForm['primaryNiche']) ?? NICHES[0],
      experienceYears: profile.experienceYears ?? undefined,
      photoUrl: profile.profilePhotoUrl ?? '',
      bannerUrl: profile.coverBannerUrl ?? undefined,
      socialLinks: {
        youtube: profile.socialLinks?.youtube ?? '',
        linkedin: profile.socialLinks?.linkedin ?? '',
        instagram: profile.socialLinks?.instagram ?? '',
        twitter: profile.socialLinks?.twitter ?? '',
        website: profile.socialLinks?.website ?? '',
      },
      languages: profile.languages?.length ? profile.languages : ['English'],
      tags: profile.tags ?? [],
    })
  }, [profile, reset])

  // Scroll tracking to highlight navigation tabs
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id.replace('section-', ''))
          }
        })
      },
      {
        rootMargin: '-130px 0px -70% 0px',
        threshold: 0,
      }
    )

    SECTIONS.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`)
    if (el) {
      const offset = 130 // topbar height + sticky nav bar height + visual padding
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // ── Username availability (debounced; only when changed + valid format) ──
  const [debouncedUsername, setDebouncedUsername] = useState(values.username)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedUsername(values.username), 400)
    return () => clearTimeout(t)
  }, [values.username])

  const usernameChanged = debouncedUsername !== profile.username
  const usernameFormatOk = !validateUsername(debouncedUsername)
  const { data: availability, isFetching: checkingUsername } = useUsernameAvailability(
    debouncedUsername,
    usernameChanged && usernameFormatOk,
  )

  // ── Photo upload ──
  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const err = await validateImageFile(file)
    if (err) { toast.error(err); return }
    if (photoToken) void tryDeleteCloudinaryUpload(photoToken)
    setPhotoUploading(true)
    try {
      const result = await uploadToCloudinary(file)
      setValue('photoUrl', result.url, { shouldValidate: true, shouldDirty: true })
      setPhotoToken(result.deleteToken)
    } catch (err2) {
      toast.error(err2 instanceof Error ? err2.message : 'Upload failed — try again')
    } finally {
      setPhotoUploading(false)
    }
  }

  // ── Tags ──
  function addTag(): void {
    const t = tagInput.trim()
    if (t && !values.tags.includes(t) && values.tags.length < 5) {
      setValue('tags', [...values.tags, t], { shouldValidate: true, shouldDirty: true })
    }
    setTagInput('')
  }
  function removeTag(tag: string): void {
    setValue('tags', values.tags.filter((x) => x !== tag), { shouldValidate: true, shouldDirty: true })
  }

  // ── Languages ──
  function toggleLanguage(lang: string): void {
    const has = values.languages.includes(lang)
    const next = has ? values.languages.filter((l) => l !== lang) : [...values.languages, lang]
    if (next.length === 0) return // keep at least one
    setValue('languages', next, { shouldValidate: true, shouldDirty: true })
  }

  // Determine section validation errors for tab indicator dot
  const hasSectionError = (id: string) => {
    switch (id) {
      case 'identity':
        return !!(errors.displayName || errors.username || errors.experienceYears)
      case 'media':
        return !!(errors.photoUrl || errors.bannerUrl)
      case 'about':
        return !!(errors.bio || errors.tags)
      case 'languages':
        return !!errors.languages
      case 'socials':
        return !!errors.socialLinks
      default:
        return false
    }
  }

  // ── Save ──
  async function onSubmit(data: EditProfileForm): Promise<void> {
    if (usernameChanged && availability && !availability.available) {
      toast.error('That username is unavailable. Pick another.')
      return
    }
    const socialLinks = Object.fromEntries(
      Object.entries(data.socialLinks).filter(([, v]) => typeof v === 'string' && v.trim() !== ''),
    ) as UpdateCreatorProfileRequest['socialLinks']

    const body: UpdateCreatorProfileRequest = {
      displayName: data.displayName,
      username: data.username,
      bio: data.bio,
      primaryNiche: data.primaryNiche,
      socialLinks,
      languages: data.languages,
      tags: data.tags,
      ...(data.experienceYears !== undefined ? { experienceYears: data.experienceYears } : {}),
      ...(data.photoUrl ? { profilePhotoUrl: data.photoUrl } : {}),
      ...(data.bannerUrl !== undefined ? { coverBannerUrl: data.bannerUrl } : {}),
    }
    try {
      const updatedProfile = await update.mutateAsync(body)
      setPhotoToken(null) // committed
      
      reset({
        displayName: updatedProfile.displayName ?? '',
        username: updatedProfile.username ?? '',
        bio: updatedProfile.bio ?? '',
        primaryNiche: (updatedProfile.primaryNiche as EditProfileForm['primaryNiche']) ?? NICHES[0],
        experienceYears: updatedProfile.experienceYears ?? undefined,
        photoUrl: updatedProfile.profilePhotoUrl ?? '',
        bannerUrl: updatedProfile.coverBannerUrl ?? undefined,
        socialLinks: {
          youtube: updatedProfile.socialLinks?.youtube ?? '',
          linkedin: updatedProfile.socialLinks?.linkedin ?? '',
          instagram: updatedProfile.socialLinks?.instagram ?? '',
          twitter: updatedProfile.socialLinks?.twitter ?? '',
          website: updatedProfile.socialLinks?.website ?? '',
        },
        languages: updatedProfile.languages?.length ? updatedProfile.languages : ['English'],
        tags: updatedProfile.tags ?? [],
      })
      
      setPreviewUsername(updatedProfile.username ?? null)
      setPreviewReloadKey((k) => k + 1) // reload the preview iframe with saved data
      router.refresh()
      toast.success('Profile updated', 'Your public page reflects the changes.')
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Could not save. Try again.')
    }
  }

  const saving = isSubmitting || update.isPending
  const isSaveDisabled = !isDirty || saving || (usernameChanged && availability && !availability.available)

  const getSocialIconColor = (key: string, isFocused: boolean) => {
    if (!isFocused) return 'text-muted-foreground transition-colors duration-200'
    switch (key) {
      case 'instagram': return 'text-[#E1306C] transition-colors duration-200'
      case 'twitter': return 'text-foreground dark:text-white transition-colors duration-200'
      case 'linkedin': return 'text-[#0077B5] transition-colors duration-200'
      case 'youtube': return 'text-[#FF0000] transition-colors duration-200'
      case 'website': return 'text-primary transition-colors duration-200'
      default: return 'text-primary transition-colors duration-200'
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 p-4 sm:p-6 lg:grid-cols-12 lg:items-start max-w-7xl mx-auto w-full">
      {/* ── Left: form ── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 lg:col-span-7 flex flex-col"
      >
        {/* Sticky Local Section-Navigation */}
        <div className="sticky top-[64px] z-20 -mx-4 sm:-mx-6 bg-background/95 border-b border-border px-4 sm:px-6 py-4 backdrop-blur-md flex items-center gap-6 overflow-x-auto scrollbar-none shadow-sm">
          {SECTIONS.map((s) => {
            const active = activeSection === s.id
            const error = hasSectionError(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 shrink-0 select-none",
                  active 
                    ? "bg-[#006CE6] text-white shadow-md shadow-blue-500/10" 
                    : "text-muted-foreground hover:text-foreground bg-transparent"
                )}
              >
                <span>{s.label}</span>
                {error && (
                  <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
                )}
              </button>
            )
          })}
        </div>

        <div className="space-y-6 mt-4">
          {/* Identity Section Card */}
          <section 
            id="section-identity" 
            className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5 scroll-mt-36 transition-all duration-300 hover:shadow-md"
          >
            <Heading title="Identity" subtitle="Your name, handle, and what you teach." />

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-semibold">Display name</Label>
              <Input 
                id="displayName" 
                className={cn(
                  "h-11 transition-all duration-200",
                  errors.displayName && "border-destructive/80 focus-visible:ring-destructive/30"
                )} 
                aria-invalid={!!errors.displayName} 
                {...register('displayName')} 
              />
              <ValidationError msg={errors.displayName?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold">Page link</Label>
              <div 
                className={cn(
                  "flex h-11 items-center rounded-lg border border-input bg-card pl-3 transition-all duration-200 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
                  errors.username && "border-destructive/80 focus-within:border-destructive/80 focus-within:ring-destructive/25"
                )}
              >
                <span className="text-sm text-muted-foreground select-none">creonex.in/c/</span>
                <Input 
                  id="username" 
                  className="h-full border-0 pl-1 focus-visible:ring-0 focus-visible:ring-offset-0" 
                  {...register('username')} 
                />
                
                {/* Availability Badge */}
                <div className="flex items-center px-3 shrink-0">
                  {!usernameChanged && values.username ? (
                    <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <FontAwesomeIcon icon={faCheck} className="size-2.5" />
                      <span>Current</span>
                    </div>
                  ) : usernameFormatOk ? (
                    checkingUsername ? (
                      <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        <FontAwesomeIcon icon={faSpinner} className="size-2.5 animate-spin" />
                        <span>Checking…</span>
                      </div>
                    ) : availability?.available ? (
                      <div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <FontAwesomeIcon icon={faCircleCheck} className="size-2.5" />
                        <span>Available</span>
                      </div>
                    ) : availability ? (
                      <div className="flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/5 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                        <FontAwesomeIcon icon={faCircleXmark} className="size-2.5" />
                        <span>Taken</span>
                      </div>
                    ) : null
                  ) : null}
                </div>
              </div>
              <ValidationError msg={errors.username?.message} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryNiche" className="text-sm font-semibold">Primary niche</Label>
                <Select 
                  value={values.primaryNiche} 
                  onValueChange={(v) => v && setValue('primaryNiche', v as EditProfileForm['primaryNiche'], { shouldValidate: true, shouldDirty: true })}
                >
                  <SelectTrigger id="primaryNiche" className="h-11 w-full"><SelectValue placeholder="Select niche" /></SelectTrigger>
                  <SelectContent>
                    {NICHES.map((n) => <SelectItem key={n} value={n}>{formatNiche(n)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceYears" className="text-sm font-semibold">Years of experience</Label>
                <Input
                  id="experienceYears" type="number" inputMode="numeric" 
                  className={cn(
                    "h-11 transition-all duration-200",
                    errors.experienceYears && "border-destructive/80 focus-visible:ring-destructive/30"
                  )} 
                  placeholder="e.g. 5"
                  aria-invalid={!!errors.experienceYears}
                  {...register('experienceYears', { setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })}
                />
                <ValidationError msg={errors.experienceYears?.message} />
              </div>
            </div>
          </section>

          {/* Media Section Card */}
          <section 
            id="section-media" 
            className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5 scroll-mt-36 transition-all duration-300 hover:shadow-md"
          >
            <Heading title="Photo & banner" subtitle="Your avatar and cover image." />

            <div className="flex items-center gap-5">
              <div 
                onClick={() => !photoUploading && fileRef.current?.click()}
                className="group relative size-20 rounded-full border border-border bg-muted overflow-hidden cursor-pointer shadow-sm hover:border-primary/50 transition-all duration-300 flex items-center justify-center shrink-0"
              >
                <Avatar className="size-full">
                  {values.photoUrl ? <AvatarImage src={values.photoUrl} alt="" className="object-cover transition-transform duration-300 group-hover:scale-105" /> : null}
                  <AvatarFallback className="bg-primary/5 text-lg font-bold text-primary transition-colors duration-300 group-hover:bg-primary/10">
                    {getInitials(values.displayName || profile.username || 'C')}
                  </AvatarFallback>
                </Avatar>

                {/* Upload Hover State */}
                <div className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white transition-opacity duration-200",
                  photoUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  {photoUploading ? (
                    <FontAwesomeIcon icon={faSpinner} className="size-5 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUpload} className="size-4 mb-0.5" />
                      <span className="text-[9px] font-semibold uppercase tracking-wider">Change</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  disabled={photoUploading} 
                  onClick={() => fileRef.current?.click()}
                  className="h-9 border-border/80 hover:bg-muted font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={photoUploading ? faSpinner : faUpload} className={cn('size-3.5 mr-1.5', photoUploading && 'animate-spin')} />
                  {photoUploading ? 'Uploading…' : 'Change photo'}
                </Button>
                <p className="text-[11px] text-muted-foreground/80 leading-normal">
                  JPG, PNG, or WebP · up to 5MB
                </p>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPhotoChange} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Cover banner</Label>
              <button
                type="button"
                onClick={() => setBannerOpen(true)}
                className="group relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-muted/30 shadow-sm transition-all duration-300 hover:border-primary/45 focus:outline-none"
                style={values.bannerUrl && !values.bannerUrl.startsWith('http') ? { background: values.bannerUrl } : undefined}
              >
                {values.bannerUrl?.startsWith('http') && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={values.bannerUrl} 
                    alt="" 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                )}
                
                {/* Visual Glass Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />

                <span className="relative z-10 flex items-center gap-2 rounded-xl bg-background/90 px-3.5 py-2 text-xs font-semibold text-foreground shadow-md backdrop-blur-sm transition-all duration-300 group-hover:bg-background group-hover:shadow-lg group-hover:scale-[1.02]">
                  <FontAwesomeIcon icon={faImage} className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" /> 
                  <span>Change cover image</span>
                </span>
              </button>
            </div>
          </section>

          {/* About Section Card */}
          <section 
            id="section-about" 
            className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5 scroll-mt-36 transition-all duration-300 hover:shadow-md"
          >
            <Heading title="About" subtitle="Your bio and areas of expertise." />
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-semibold">Bio</Label>
              <Textarea 
                id="bio" 
                rows={5} 
                className={cn(
                  "transition-all duration-200 resize-none",
                  errors.bio && "border-destructive/80 focus-visible:ring-destructive/30"
                )}
                aria-invalid={!!errors.bio} 
                {...register('bio')} 
                placeholder="Tell learners about your experience and how you help." 
              />
              <ValidationError msg={errors.bio?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-semibold flex items-center justify-between">
                <span>Expertise tags</span>
                <span className={cn(
                  "text-xs font-normal transition-colors",
                  values.tags.length >= 5 ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {values.tags.length}/5 max
                </span>
              </Label>
              
              {values.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 py-1">
                  {values.tags.map((t) => (
                    <span 
                      key={t} 
                      className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 py-1 pl-3.5 pr-2 text-xs font-medium text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/10"
                    >
                      {t}
                      <button 
                        type="button" 
                        onClick={() => removeTag(t)} 
                        className="flex size-4.5 items-center justify-center rounded-full hover:bg-primary/20 transition-colors" 
                        aria-label={`Remove ${t}`}
                      >
                        <FontAwesomeIcon icon={faXmark} className="size-3 text-primary/70 hover:text-primary" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="tags" 
                    className={cn(
                      "h-11 transition-all duration-200",
                      errors.tags && "border-destructive/80 focus-visible:ring-destructive/30"
                    )} 
                    value={tagInput} 
                    disabled={values.tags.length >= 5}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter') { 
                        e.preventDefault() 
                        addTag() 
                      } 
                    }}
                    placeholder={values.tags.length >= 5 ? "Maximum tags reached" : "Add a skill and press Enter"}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="size-11 shrink-0 border-border/85 hover:bg-muted transition-colors" 
                  onClick={addTag} 
                  disabled={values.tags.length >= 5} 
                  aria-label="Add tag"
                >
                  <FontAwesomeIcon icon={faPlus} className="size-4" />
                </Button>
              </div>
              <ValidationError msg={errors.tags?.message} />
            </div>
          </section>

          {/* Languages Section Card */}
          <section 
            id="section-languages" 
            className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-4 scroll-mt-36 transition-all duration-300 hover:shadow-md"
          >
            <Heading title="Languages" subtitle="Languages you teach in." />
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const active = values.languages.includes(lang)
                return (
                  <button
                    key={lang} 
                    type="button" 
                    onClick={() => toggleLanguage(lang)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-sm',
                      active 
                        ? 'border-primary bg-primary text-primary-foreground scale-[1.03] shadow-md' 
                        : 'border-border/80 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground hover:scale-[1.01]',
                    )}
                  >
                    {active && <FontAwesomeIcon icon={faCheck} className="size-3 animate-in zoom-in-50 duration-200" />}
                    <span>{lang}</span>
                  </button>
                )
              })}
            </div>
            <ValidationError msg={errors.languages?.message} />
          </section>

          {/* Socials Section Card */}
          <section 
            id="section-socials" 
            className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-4 scroll-mt-36 transition-all duration-300 hover:shadow-md"
          >
            <Heading title="Social links" subtitle="Full URLs to your profiles." />
            
            <div className="space-y-4">
              {SOCIAL_FIELDS.map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <div 
                    className={cn(
                      "flex h-11 items-center rounded-lg border border-input bg-card pl-3 transition-all duration-200 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
                      errors.socialLinks?.[s.key] && "border-destructive/80 focus-within:border-destructive/80 focus-within:ring-destructive/25"
                    )}
                  >
                    <FontAwesomeIcon 
                      icon={s.icon} 
                      className={cn("size-4 shrink-0", getSocialIconColor(s.key, focusedSocial === s.key))} 
                    />
                    <Input 
                      className="h-full border-0 pl-2.5 focus-visible:ring-0 focus-visible:ring-offset-0" 
                      placeholder={s.placeholder} 
                      aria-invalid={!!errors.socialLinks?.[s.key]} 
                      {...register(`socialLinks.${s.key}`)} 
                      onFocus={() => setFocusedSocial(s.key)}
                      onBlur={() => setFocusedSocial(null)}
                    />
                  </div>
                  <ValidationError msg={errors.socialLinks?.[s.key]?.message} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-border pt-6 mt-6">
          <div className="text-xs text-muted-foreground">
            {isDirty ? (
              <span className="text-amber-600 font-semibold animate-pulse">● Unsaved changes</span>
            ) : (
              <span>All changes saved</span>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isSaveDisabled} 
            className="h-11 px-6 font-semibold shadow-sm transition-all"
          >
            <FontAwesomeIcon icon={saving ? faSpinner : faCheck} className={cn('size-4 mr-1.5', saving && 'animate-spin')} />
            Save changes
          </Button>
        </div>

        {/* Floating Save/Discard Dock */}
        {isDirty && (
          <div className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-foreground">Unsaved changes</span>
              <span className="text-[10px] text-muted-foreground">Press save to publish changes.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => reset()}
                disabled={saving}
                className="h-8 rounded-xl border border-border/60 hover:bg-muted text-xs font-semibold transition-colors"
              >
                Discard
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaveDisabled}
                className="h-8 rounded-xl px-3.5 text-xs font-semibold shadow-sm transition-all"
              >
                {saving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="mr-1 size-3 animate-spin" />
                    Saving
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* ── Right: live preview ── */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 mt-8 lg:mt-0">
        <ProfileLivePreview username={previewUsername} reloadKey={previewReloadKey} />
      </div>

      <BannerPickerDialog
        open={bannerOpen}
        onOpenChange={setBannerOpen}
        current={{ bannerUrl: values.bannerUrl }}
        onApply={(sel) => setValue('bannerUrl', sel.bannerUrl, { shouldValidate: true, shouldDirty: true })}
      />
    </div>
  )
}

function Heading({ title, subtitle }: { title: string; subtitle: string }): React.ReactElement {
  return (
    <div className="space-y-1 select-none">
      <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground/80">{subtitle}</p>
    </div>
  )
}

function ValidationError({ msg }: { msg?: string }): React.ReactElement | null {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1.5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
      <FontAwesomeIcon icon={faCircleXmark} className="size-3 shrink-0" />
      <span>{msg}</span>
    </p>
  )
}
