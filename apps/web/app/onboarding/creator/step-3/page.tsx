'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft, faArrowRight, faCheck,
  faCloudArrowUp, faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { creatorStep3Schema, type CreatorStep3Form } from '@/lib/onboarding-schemas'
import {
  validateBannerFile,
  uploadToCloudinary,
  tryDeleteCloudinaryUpload,
} from '@/lib/cloudinary'

const BANNER_PRESETS = [
  { id: 'cosmic',   label: 'Cosmic',   value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 'sunrise',  label: 'Sunrise',  value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  { id: 'aurora',   label: 'Aurora',   value: 'linear-gradient(135deg, #0d324d 0%, #7f5a83 50%, #43b89c 100%)' },
  { id: 'forest',   label: 'Forest',   value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { id: 'ocean',    label: 'Ocean',    value: 'linear-gradient(135deg, #005c97 0%, #363795 100%)' },
  { id: 'charcoal', label: 'Charcoal', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
]

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Marathi',
  'Bengali', 'Kannada', 'Malayalam', 'Punjabi', 'Gujarati', 'Urdu', 'Odia',
]

const STORAGE_KEY = 'creonex-onboarding-step3'

type Persisted = {
  bannerUrl?: string
  bannerDeleteToken?: string
  languages?: string[]
}

export default function CreatorStep3Page() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [activeTab, setActiveTab] = useState<'preset' | 'upload'>('preset')
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [cropUploading, setCropUploading] = useState(false)
  const [cropError, setCropError] = useState('')
  const [bannerDeleteToken, setBannerDeleteToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [hydrated, setHydrated] = useState(false)

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatorStep3Form>({
    resolver: zodResolver(creatorStep3Schema),
    defaultValues: { bannerUrl: undefined, languages: ['English'] },
  })

  const bannerUrl = watch('bannerUrl')
  const languages = watch('languages')

  const isPresetBanner = Boolean(bannerUrl && BANNER_PRESETS.some((p) => p.value === bannerUrl))
  const isUploadedBanner = Boolean(bannerUrl && !isPresetBanner)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Persisted
        reset({
          bannerUrl: parsed.bannerUrl,
          languages: Array.isArray(parsed.languages) && parsed.languages.length > 0
            ? parsed.languages
            : ['English'],
        })
        if (parsed.bannerDeleteToken) setBannerDeleteToken(parsed.bannerDeleteToken)
        if (parsed.bannerUrl && !BANNER_PRESETS.some((p) => p.value === parsed.bannerUrl)) {
          setActiveTab('upload')
        }
      }
    } catch { /* corrupt */ }
    setHydrated(true)
    router.prefetch('/onboarding/creator/step-4')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      const persisted: Persisted = { bannerUrl, bannerDeleteToken, languages }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    } catch { /* non-fatal */ }
  }, [bannerUrl, bannerDeleteToken, languages, hydrated])

  useEffect(() => {
    return () => {
      if (bannerDeleteToken) void tryDeleteCloudinaryUpload(bannerDeleteToken)
    }
  }, [bannerDeleteToken])

  async function handleBannerFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setCropError('')
    const validationError = await validateBannerFile(file)
    if (validationError) {
      setCropError(validationError)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setCropSrc(objectUrl)
    setCrop(undefined)
    setCompletedCrop(undefined)
    setCropOpen(true)
  }

  function onCropImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 3 / 1, w, h),
      w, h,
    )
    setCrop(initialCrop)
  }

  async function applyCrop() {
    if (!imgRef.current || !completedCrop || !cropSrc) return
    const img = imgRef.current
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(completedCrop.width * scaleX)
    canvas.height = Math.floor(completedCrop.height * scaleY)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0,
      canvas.width, canvas.height,
    )

    setCropUploading(true)
    setCropError('')
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => { if (b) resolve(b); else reject(new Error('Canvas empty')) },
          'image/jpeg', 0.92,
        )
      })

      if (bannerDeleteToken && isUploadedBanner) {
        void tryDeleteCloudinaryUpload(bannerDeleteToken)
      }

      const file = new File([blob], 'banner.jpg', { type: 'image/jpeg' })
      const result = await uploadToCloudinary(file)
      setValue('bannerUrl', result.url, { shouldValidate: true })
      setBannerDeleteToken(result.deleteToken)
      closeCropModal()
    } catch (err) {
      setCropError(err instanceof Error ? err.message : 'Upload failed — try again')
    } finally {
      setCropUploading(false)
    }
  }

  function closeCropModal() {
    setCropOpen(false)
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setCrop(undefined)
    setCompletedCrop(undefined)
    setCropError('')
  }

  function selectPreset(gradientValue: string) {
    if (bannerDeleteToken && isUploadedBanner) {
      void tryDeleteCloudinaryUpload(bannerDeleteToken)
      setBannerDeleteToken('')
    }
    setValue(
      'bannerUrl',
      bannerUrl === gradientValue ? undefined : gradientValue,
      { shouldValidate: true },
    )
  }

  function removeUploadedBanner() {
    if (bannerDeleteToken) void tryDeleteCloudinaryUpload(bannerDeleteToken)
    setBannerDeleteToken('')
    setValue('bannerUrl', undefined, { shouldValidate: true })
  }

  function toggleLanguage(lang: string) {
    const current = languages ?? []
    const updated = current.includes(lang)
      ? current.filter((l) => l !== lang)
      : [...current, lang]
    setValue('languages', updated, { shouldValidate: true })
  }

  const onSubmit = async (data: CreatorStep3Form) => {
    setLoading(true)
    setApiError('')
    try {
      const res = await fetch('/api/v1/onboarding/creator/step-3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...(data.bannerUrl ? { bannerUrl: data.bannerUrl } : {}),
          languages: data.languages,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        setApiError(body.message ?? 'Something went wrong — please try again')
        return
      }
      setBannerDeleteToken('')
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* non-fatal */ }
      router.push('/onboarding/creator/step-4')
    } catch {
      setApiError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Crop modal */}
      {cropOpen && cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <p className="font-semibold text-sm">Crop your banner</p>
                <p className="text-xs text-muted-foreground">Locked to 3:1 — drag corners to adjust</p>
              </div>
              <button
                type="button"
                onClick={closeCropModal}
                disabled={cropUploading}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faXmark} className="size-4" />
              </button>
            </div>

            <div className="overflow-auto max-h-[60vh] p-4 bg-muted/40 flex items-center justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={3 / 1}
                minWidth={100}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={cropSrc}
                  alt="Banner crop preview"
                  onLoad={onCropImageLoad}
                  className="max-w-full max-h-[50vh] object-contain"
                />
              </ReactCrop>
            </div>

            {cropError && (
              <p className="px-6 py-2 text-xs text-destructive">{cropError}</p>
            )}

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={closeCropModal} disabled={cropUploading}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={applyCrop}
                disabled={!completedCrop || cropUploading}
              >
                {cropUploading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : 'Apply crop'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full rounded-3xl border border-border/60 bg-card shadow-xl shadow-black/[0.04] overflow-hidden">
        <div className="w-full h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: '75%' }} />
        </div>

        <div className="flex flex-col items-center px-6 py-10 sm:p-12">
          <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <p className="text-xs text-muted-foreground text-center tracking-wide uppercase">Step 3 of 4</p>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Make your profile stand out</h1>
              <p className="text-sm text-muted-foreground">Pick a banner and the languages you teach in</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

              {/* Banner */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Profile banner</Label>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>

                {/* 3:1 preview strip */}
                <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: 'calc(100% / 3)' }}>
                  <div
                    className="absolute inset-0 transition-all duration-500"
                    style={
                      bannerUrl
                        ? isUploadedBanner
                          ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                          : { background: bannerUrl }
                        : undefined
                    }
                  >
                    {!bannerUrl && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-muted border-2 border-dashed border-border">
                        <p className="text-xs text-muted-foreground">Banner preview</p>
                      </div>
                    )}
                    {isUploadedBanner && (
                      <button
                        type="button"
                        onClick={removeUploadedBanner}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        aria-label="Remove banner"
                      >
                        <FontAwesomeIcon icon={faXmark} className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab switcher */}
                <div className="flex rounded-lg bg-muted p-1 gap-1">
                  {(['preset', 'upload'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'flex-1 rounded-md py-1.5 text-xs font-medium transition-all',
                        activeTab === tab
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {tab === 'preset' ? 'Choose a template' : 'Upload your own'}
                    </button>
                  ))}
                </div>

                {activeTab === 'preset' && (
                  <div className="grid grid-cols-3 gap-2">
                    {BANNER_PRESETS.map((preset) => {
                      const selected = bannerUrl === preset.value
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => selectPreset(preset.value)}
                          aria-label={preset.label}
                          className={cn(
                            'relative overflow-hidden rounded-lg transition-all active:scale-95',
                            selected
                              ? 'ring-2 ring-primary ring-offset-2'
                              : 'ring-1 ring-border hover:ring-primary/50',
                          )}
                          style={{ paddingBottom: 'calc(100% / 3)' }}
                        >
                          <div className="absolute inset-0" style={{ background: preset.value }} />
                          {selected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 shadow-sm">
                                <FontAwesomeIcon icon={faCheck} className="size-2.5 text-primary" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-black/30">
                            <p className="text-[9px] font-medium text-white leading-none">{preset.label}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {activeTab === 'upload' && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex flex-col items-center gap-2.5 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center transition-colors hover:border-primary hover:bg-muted/50 active:scale-[0.99]"
                    >
                      <FontAwesomeIcon icon={faCloudArrowUp} className="size-7 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Click to upload</p>
                        <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG, WebP · Max 10 MB · Min 800 px wide</p>
                      </div>
                    </button>
                    {cropError && (
                      <p className="text-xs text-destructive">{cropError}</p>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleBannerFileSelect}
                    />
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <Label>
                  Teaching languages{' '}
                  <span className="text-muted-foreground font-normal">(select all that apply)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const active = (languages ?? []).includes(lang)
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={cn(
                          'px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all active:scale-95',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary/50',
                        )}
                      >
                        {lang}
                      </button>
                    )
                  })}
                </div>
                {errors.languages && (
                  <p className="text-xs text-destructive">{errors.languages.message}</p>
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
                  onClick={() => router.push('/onboarding/creator/step-2')}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="size-4 mr-1" />
                  Back
                </Button>

                <Button type="submit" size="sm" disabled={loading}>
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
    </>
  )
}
