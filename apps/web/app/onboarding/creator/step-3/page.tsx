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
import { useSaveCreatorStep3, useCreatorProfile } from '@/hooks/use-onboarding'
import { isApiError } from '@/lib/api'
import { tryDeleteCloudinaryUpload } from '@/lib/cloudinary'
import { StepHeading } from '@/components/onboarding/step-heading'
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

  const { data: savedProfile } = useCreatorProfile()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [bannerDeleteToken, setBannerDeleteToken] = useState('')
  const [apiError, setApiError] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [hadStoredData, setHadStoredData] = useState(false)

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
        // Only block API fallback if there's real user-entered content
        const hasMeaningful = !!(
          parsed.bannerUrl ||
          (Array.isArray(parsed.languages) && parsed.languages.length > 1)
        )
        if (hasMeaningful) setHadStoredData(true)
      }
    } catch { /* corrupt */ }
    setHydrated(true)
    router.prefetch('/onboarding/creator/step-4')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // API fallback: populate from DB when sessionStorage was empty
  useEffect(() => {
    if (!hydrated || hadStoredData || !savedProfile) return
    reset({
      bannerUrl: savedProfile.coverBannerUrl ?? undefined,
      languages: savedProfile.languages?.length > 0 ? savedProfile.languages : ['English'],
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, hadStoredData, savedProfile])

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

      <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-300">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <StepHeading
            stepLabel="Step 3 · Presence"
            title="Make your profile stand out"
            subtitle="Pick a banner and the languages you teach in"
          />

          {/* Banner */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Profile Cover</Label>
                <p className="text-[13px] text-muted-foreground font-normal mt-0.5">Choose a cover image to add personality to your page.</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md hidden sm:inline-block">Optional</span>
            </div>

            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="group relative block w-full overflow-hidden rounded-2xl ring-1 ring-border/50 shadow-sm transition-all hover:ring-foreground/30 hover:shadow-md hover:shadow-black/5"
              style={{ paddingBottom: '35%' }}
              aria-label={bannerUrl ? 'Change banner' : 'Choose a banner'}
            >
              <span
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.02]"
                style={
                  bannerUrl
                    ? bannerIsUploaded
                      ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { background: bannerUrl }
                    : undefined
                }
              >
                {!bannerUrl && (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border bg-card/50 transition-colors group-hover:bg-muted/50 group-hover:border-foreground/30">
                    <div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm transition-transform group-hover:-translate-y-1">
                      <FontAwesomeIcon icon={faImage} className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Upload or choose a cover</span>
                  </span>
                )}
              </span>

              {bannerUrl && (
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all group-hover:bg-black/80">
                  <FontAwesomeIcon icon={faPenToSquare} className="size-3.5" />
                  Edit Cover
                </span>
              )}
            </button>
          </div>

          <div className="my-8 h-px w-full bg-border/60" />

          {/* Languages */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Teaching Languages</Label>
              <p className="text-[13px] text-muted-foreground font-normal mt-0.5">Which languages are you comfortable speaking in sessions?</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {LANGUAGES.map((lang) => {
                const active = (languages ?? []).includes(lang)
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-95',
                      active
                        ? 'border-foreground bg-foreground text-background shadow-sm'
                        : 'border-border/60 bg-card hover:border-foreground/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {lang}
                  </button>
                )
              })}
            </div>
            {errors.languages && (
              <p className="text-[13px] font-medium text-destructive">{errors.languages.message}</p>
            )}
          </div>

          {apiError && (
            <p className="text-[13px] font-medium text-destructive animate-in fade-in duration-200">{apiError}</p>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/onboarding/creator/step-2')}
              className="font-semibold"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2 size-4" />
              Back
            </Button>

            <Button type="submit" size="lg" disabled={isPending} className="font-semibold shadow-sm">
              {isPending ? (
                <span className="size-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  Next
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
