'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft, faArrowRight, faImage, faPenToSquare,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { creatorStep3Schema, type CreatorStep3Form } from '@/lib/onboarding-schemas'
import { useSaveCreatorStep3 } from '@/hooks/use-onboarding'
import { isApiError } from '@/lib/api'
import { tryDeleteCloudinaryUpload } from '@/lib/cloudinary'
import {
  BannerPickerDialog,
  isPresetValue,
  type BannerSelection,
} from '@/components/onboarding/creator/banner-picker-dialog'

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
  const { mutateAsync, isPending } = useSaveCreatorStep3()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [bannerDeleteToken, setBannerDeleteToken] = useState('')
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
  const bannerIsUploaded = Boolean(bannerUrl && !isPresetValue(bannerUrl))

  // Restore from sessionStorage
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
      }
    } catch { /* corrupt */ }
    setHydrated(true)
    router.prefetch('/onboarding/creator/step-4')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist on change
  useEffect(() => {
    if (!hydrated) return
    try {
      const persisted: Persisted = { bannerUrl, bannerDeleteToken, languages }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    } catch { /* non-fatal */ }
  }, [bannerUrl, bannerDeleteToken, languages, hydrated])

  // Clean up an abandoned (never-submitted) upload — on real unmount only.
  // Keyed cleanup would wrongly delete the just-saved banner when the token is
  // cleared on submit, so we read the latest token from a ref instead.
  const bannerTokenRef = useRef('')
  const submittedRef = useRef(false)
  useEffect(() => { bannerTokenRef.current = bannerDeleteToken }, [bannerDeleteToken])
  useEffect(() => {
    return () => {
      if (bannerTokenRef.current && !submittedRef.current) {
        void tryDeleteCloudinaryUpload(bannerTokenRef.current)
      }
    }
  }, [])

  function handleBannerApply(sel: BannerSelection) {
    // Replacing a previously uploaded banner with something else → clean the old token
    if (bannerDeleteToken && bannerDeleteToken !== sel.deleteToken) {
      void tryDeleteCloudinaryUpload(bannerDeleteToken)
    }
    setValue('bannerUrl', sel.bannerUrl, { shouldValidate: true })
    setBannerDeleteToken(sel.deleteToken ?? '')
  }

  function toggleLanguage(lang: string) {
    const current = languages ?? []
    const updated = current.includes(lang)
      ? current.filter((l) => l !== lang)
      : [...current, lang]
    setValue('languages', updated, { shouldValidate: true })
  }

  const onSubmit = async (data: CreatorStep3Form) => {
    setApiError('')
    try {
      await mutateAsync({
        ...(data.bannerUrl ? { bannerUrl: data.bannerUrl } : {}),
        languages: data.languages,
      })
      submittedRef.current = true
      setBannerDeleteToken('')
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* non-fatal */ }
      router.push('/onboarding/creator/step-4')
    } catch (e) {
      setApiError(isApiError(e) ? e.message : 'Network error — please try again')
    }
  }

  return (
    <>
      <BannerPickerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        current={{ bannerUrl, deleteToken: bannerDeleteToken || undefined }}
        onApply={handleBannerApply}
      />

      <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl shadow-black/[0.04]">
        <div className="h-1 w-full bg-muted">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: '75%' }} />
        </div>

        <div className="flex flex-col items-center px-6 py-10 sm:p-12">
          <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <p className="text-center text-xs uppercase tracking-wide text-muted-foreground">Step 3 of 4</p>

            <div className="space-y-2 text-center">
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

                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="group relative block w-full overflow-hidden rounded-xl ring-1 ring-border transition-all hover:ring-primary/50"
                  style={{ paddingBottom: 'calc(100% / 3)' }}
                  aria-label={bannerUrl ? 'Change banner' : 'Choose a banner'}
                >
                  <span
                    className="absolute inset-0 transition-all duration-500"
                    style={
                      bannerUrl
                        ? bannerIsUploaded
                          ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                          : { background: bannerUrl }
                        : undefined
                    }
                  >
                    {!bannerUrl && (
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border bg-muted">
                        <FontAwesomeIcon icon={faImage} className="size-5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Choose a banner</span>
                      </span>
                    )}
                  </span>

                  {bannerUrl && (
                    <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors group-hover:bg-black/65">
                      <FontAwesomeIcon icon={faPenToSquare} className="size-3" />
                      Change
                    </span>
                  )}
                </button>
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <Label>
                  Teaching languages{' '}
                  <span className="font-normal text-muted-foreground">(select all that apply)</span>
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
                          'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-95',
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
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-1 size-4" />
                  Back
                </Button>

                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      Next
                      <FontAwesomeIcon icon={faArrowRight} className="ml-1 size-4" />
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
