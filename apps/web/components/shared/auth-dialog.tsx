'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Where Google OAuth returns to after sign-in. */
  callbackURL: string
  title?: string
  description?: string
}

function mapAuthError(error: { message?: string; status?: number; code?: string }): string {
  if (error.status === 429) return 'Too many attempts. Wait a moment and try again.'
  if (error.status === 500) return 'Server error. Please try again in a moment.'
  return error.message ?? 'Something went wrong. Please try again.'
}

/**
 * Reusable, controlled sign-in dialog for soft auth gates (e.g. posting a review).
 * Google OAuth only — round-trips via `callbackURL`; the caller persists any draft
 * before opening so the user resumes where they left off on return.
 */
export function AuthDialog({
  open,
  onOpenChange,
  callbackURL,
  title = 'Sign in to continue',
  description = 'Sign in to your Creonex account to post your review.',
}: AuthDialogProps): React.ReactElement {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    try {
      // Better Auth resolves a relative callbackURL against the AUTH SERVER origin
      // (the NestJS API), which 404s. Anchor it to the web origin explicitly.
      const origin =
        process.env.NEXT_PUBLIC_WEB_URL ??
        (typeof window !== 'undefined' ? window.location.origin : '')
      const absoluteCallback = /^https?:\/\//.test(callbackURL)
        ? callbackURL
        : `${origin}${callbackURL}`
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: absoluteCallback,
      })
      if (error) {
        setError(mapAuthError(error))
        setLoading(false)
      }
      // success → browser redirects; keep loading
    } catch {
      setError('Unable to connect. Check your internet and try again.')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="items-center text-center">
          <div className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FontAwesomeIcon icon={faLock} className="size-5" />
          </div>
          <DialogTitle className="font-display text-lg font-bold">{title}</DialogTitle>
          <DialogDescription className="text-balance">{description}</DialogDescription>
        </DialogHeader>

        <Button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          variant="outline"
          className="mt-1 h-11 w-full gap-3 rounded-full text-sm font-semibold shadow-sm"
        >
          {loading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
              Redirecting…
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </Button>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-center text-xs text-destructive">
            {error}
          </div>
        )}

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
          <FontAwesomeIcon icon={faLock} className="size-2.5" />
          Secure sign-in · we never post on your behalf
        </p>

        <p className="text-center text-xs text-muted-foreground">
          New to Creonex?{' '}
          <Link href="/sign-up" className="font-semibold text-foreground hover:text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  )
}
