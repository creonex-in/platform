'use client'

import { useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck, faCloudArrowUp, faXmark, faCrop, faTrashCan, faImage,
} from '@fortawesome/free-solid-svg-icons'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  validateBannerFile,
  uploadToCloudinary,
  tryDeleteCloudinaryUpload,
} from '@/lib/cloudinary'

// ── Preset gradients ──────────────────────────────────────────────────────────

export const BANNER_PRESETS = [
  { id: 'cosmic',   label: 'Cosmic',   value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 'sunrise',  label: 'Sunrise',  value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  { id: 'aurora',   label: 'Aurora',   value: 'linear-gradient(135deg, #0d324d 0%, #7f5a83 50%, #43b89c 100%)' },
  { id: 'forest',   label: 'Forest',   value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { id: 'ocean',    label: 'Ocean',    value: 'linear-gradient(135deg, #005c97 0%, #363795 100%)' },
  { id: 'charcoal', label: 'Charcoal', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
] as const

export function isPresetValue(value?: string): boolean {
  return Boolean(value && BANNER_PRESETS.some((p) => p.value === value))
}

function presetLabel(value?: string): string | null {
  return BANNER_PRESETS.find((p) => p.value === value)?.label ?? null
}

export interface BannerSelection {
  bannerUrl?: string
  /** Cloudinary delete token — present only for uploaded images */
  deleteToken?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Currently committed banner on the page */
  current?: BannerSelection
  onApply: (selection: BannerSelection) => void
}

export function BannerPickerDialog({ open, onOpenChange, current, onApply }: Props): React.ReactElement {
  const fileRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  /** Token for an image uploaded inside this dialog that hasn't been applied yet */
  const pendingUploadToken = useRef<string | undefined>(undefined)

  const [tab, setTab] = useState<'preset' | 'upload'>('preset')
  const [draftUrl, setDraftUrl] = useState<string | undefined>(undefined)
  const [draftToken, setDraftToken] = useState<string | undefined>(undefined)

  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const draftIsUpload = Boolean(draftUrl && !isPresetValue(draftUrl))

  // Initialise draft from the committed banner each time the dialog opens.
  // Render-phase reset (https://react.dev/learn/you-might-not-need-an-effect) —
  // avoids the cascading renders of a setState-in-effect.
  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      // pendingUploadToken is always cleared by close() on the prior exit
      setDraftUrl(current?.bannerUrl)
      setDraftToken(current?.deleteToken)
      setTab(current?.bannerUrl && !isPresetValue(current.bannerUrl) ? 'upload' : 'preset')
      setCropSrc(null)
      setCrop(undefined)
      setCompletedCrop(undefined)
      setError('')
    }
  }

  function resetCrop() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  function selectPreset(value: string) {
    // Drop a fresh, un-applied upload when switching to a template
    if (pendingUploadToken.current) {
      void tryDeleteCloudinaryUpload(pendingUploadToken.current)
      pendingUploadToken.current = undefined
    }
    resetCrop()
    setError('')
    setDraftUrl((prev) => (prev === value ? undefined : value))
    setDraftToken(undefined)
  }

  async function handleFiles(file: File) {
    setError('')
    const validationError = await validateBannerFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    resetCrop()
    const objectUrl = URL.createObjectURL(file)
    setCropSrc(objectUrl)
  }

  function onCropImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 3 / 1, w, h), w, h))
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

    setBusy(true)
    setError('')
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => { if (b) resolve(b); else reject(new Error('Canvas empty')) },
          'image/jpeg', 0.92,
        )
      })

      // Replace any earlier un-applied upload from this session
      if (pendingUploadToken.current) {
        void tryDeleteCloudinaryUpload(pendingUploadToken.current)
      }

      const file = new File([blob], 'banner.jpg', { type: 'image/jpeg' })
      const result = await uploadToCloudinary(file)
      pendingUploadToken.current = result.deleteToken
      setDraftUrl(result.url)
      setDraftToken(result.deleteToken)
      resetCrop()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed — try again')
    } finally {
      setBusy(false)
    }
  }

  function removeUpload() {
    if (pendingUploadToken.current) {
      void tryDeleteCloudinaryUpload(pendingUploadToken.current)
      pendingUploadToken.current = undefined
    }
    setDraftUrl(undefined)
    setDraftToken(undefined)
    setError('')
  }

  function close(applied: boolean) {
    // Discard a fresh upload that was never applied
    if (!applied && pendingUploadToken.current) {
      void tryDeleteCloudinaryUpload(pendingUploadToken.current)
    }
    pendingUploadToken.current = undefined
    resetCrop()
    setError('')
    setDragActive(false)
    onOpenChange(false)
  }

  function handleUse() {
    // If a fresh upload exists but the chosen draft isn't it, discard the orphan
    const keepingUpload = draftIsUpload && draftToken === pendingUploadToken.current
    if (pendingUploadToken.current && !keepingUpload) {
      void tryDeleteCloudinaryUpload(pendingUploadToken.current)
    }
    pendingUploadToken.current = undefined
    onApply({ bannerUrl: draftUrl, deleteToken: draftIsUpload ? draftToken : undefined })
    close(true)
  }

  const draftLabel = draftIsUpload ? 'Custom upload' : presetLabel(draftUrl)

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(false) }}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 px-6 py-4">
          <div className="space-y-0.5">
            <h2 className="font-display text-base font-semibold tracking-tight">Choose your banner</h2>
            <p className="text-xs text-muted-foreground">A 3:1 strip across the top of your profile</p>
          </div>
          <button
            type="button"
            onClick={() => close(false)}
            disabled={busy}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Live preview */}
          <div
            className="relative w-full overflow-hidden rounded-2xl ring-1 ring-border/70"
            style={{ paddingBottom: 'calc(100% / 3)' }}
          >
            <div
              className="absolute inset-0 transition-all duration-500"
              style={
                draftUrl
                  ? draftIsUpload
                    ? { backgroundImage: `url(${draftUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: draftUrl }
                  : undefined
              }
            >
              {!draftUrl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted">
                  <FontAwesomeIcon icon={faImage} className="size-5 text-muted-foreground/60" />
                  <p className="text-xs text-muted-foreground">Nothing selected yet</p>
                </div>
              )}
              {draftUrl && (
                <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                  {draftLabel}
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'preset' | 'upload')}>
            <TabsList className="w-full">
              <TabsTrigger value="preset" className="gap-1.5">
                <FontAwesomeIcon icon={faImage} className="size-3.5" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-1.5">
                <FontAwesomeIcon icon={faCloudArrowUp} className="size-3.5" />
                Upload
              </TabsTrigger>
            </TabsList>

            {/* Templates */}
            <TabsContent value="preset" className="pt-4">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {BANNER_PRESETS.map((preset, i) => {
                  const selected = draftUrl === preset.value
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => selectPreset(preset.value)}
                      aria-label={preset.label}
                      style={{ paddingBottom: 'calc(100% / 3)', animationDelay: `${i * 35}ms` }}
                      className={cn(
                        'relative animate-in fade-in zoom-in-95 overflow-hidden rounded-xl transition-all duration-150 fill-mode-both active:scale-95',
                        selected
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-popover'
                          : 'ring-1 ring-border hover:-translate-y-0.5 hover:ring-primary/50 hover:shadow-md hover:shadow-primary/5',
                      )}
                    >
                      <span className="absolute inset-0" style={{ background: preset.value }} />
                      {selected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex size-6 items-center justify-center rounded-full bg-white/90 shadow-sm animate-in zoom-in duration-200">
                            <FontAwesomeIcon icon={faCheck} className="size-3 text-primary" />
                          </span>
                        </span>
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-2 py-1.5">
                        <span className="text-[10px] font-medium leading-none text-white">{preset.label}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </TabsContent>

            {/* Upload */}
            <TabsContent value="upload" className="pt-4">
              {cropSrc ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">Crop to 3:1</p>
                    <p className="text-[11px] text-muted-foreground">Drag the corners to adjust</p>
                  </div>
                  <div className="flex max-h-[42vh] items-center justify-center overflow-auto rounded-xl bg-muted/40 p-3">
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
                        className="max-h-[36vh] max-w-full object-contain"
                      />
                    </ReactCrop>
                  </div>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={resetCrop} disabled={busy}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={applyCrop} disabled={!completedCrop || busy} className="gap-1.5">
                      {busy ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      ) : (
                        <FontAwesomeIcon icon={faCrop} className="size-3.5" />
                      )}
                      Crop &amp; use
                    </Button>
                  </div>
                </div>
              ) : draftIsUpload ? (
                <div className="space-y-3">
                  <div
                    className="relative w-full overflow-hidden rounded-xl ring-1 ring-border"
                    style={{ paddingBottom: 'calc(100% / 3)' }}
                  >
                    <span
                      className="absolute inset-0"
                      style={{ backgroundImage: `url(${draftUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
                      <FontAwesomeIcon icon={faCloudArrowUp} className="size-3.5" />
                      Replace
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeUpload}
                      className="gap-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="size-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragActive(false)
                    const f = e.dataTransfer.files?.[0]
                    if (f) void handleFiles(f)
                  }}
                  className={cn(
                    'flex w-full flex-col items-center gap-2.5 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors active:scale-[0.99]',
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/30 hover:border-primary hover:bg-muted/50',
                  )}
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-background ring-1 ring-border">
                    <FontAwesomeIcon icon={faCloudArrowUp} className="size-5 text-muted-foreground" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">Drag an image here, or click to browse</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">JPEG, PNG, WebP · Max 10 MB · Min 800 px wide</span>
                  </span>
                </button>
              )}
              {error && !cropSrc && <p className="mt-2 text-xs text-destructive">{error}</p>}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (f) void handleFiles(f)
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border/60 bg-muted/40 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => close(false)} disabled={busy}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleUse} disabled={busy} className="min-w-28 gap-1.5">
            <FontAwesomeIcon icon={faCheck} className="size-3.5" />
            Use banner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
