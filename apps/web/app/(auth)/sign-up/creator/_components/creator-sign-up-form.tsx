'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faBolt } from '@fortawesome/free-solid-svg-icons'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

const PERKS = [
  '14-day discovery boost to get your first students',
  'Offer 1:1s, workshops, group sessions & digital products',
  'Keep 85% of every booking — lowest fees in the market',
  'Your own public profile page from day one',
]

function mapAuthError(error: { message?: string; status?: number; code?: string }): string {
  if (error.status === 429) return 'Too many attempts. Wait a moment and try again.'
  if (error.status === 500) return 'Server error. Please try again in a moment.'
  return error.message ?? 'Something went wrong. Please try again.'
}

interface Props {
  hasError?: boolean
}

export default function CreatorSignUpForm({ hasError }: Props): React.ReactElement {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    hasError ? 'Something went wrong setting up your creator account. Please try again.' : null,
  )

  async function handleGoogleSignUp() {
    setLoading(true)
    setError(null)
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${process.env.NEXT_PUBLIC_WEB_URL}/api/post-oauth?intent=creator`,
      })
      if (error) {
        setError(mapAuthError(error))
        setLoading(false)
      }
    } catch {
      setError('Unable to connect. Check your internet and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* LEFT SIDE */}
      <div className="relative flex flex-1 flex-col justify-between bg-[linear-gradient(to_bottom_right,hsl(var(--primary)/0.05),hsl(var(--primary)/0.01))] p-8 lg:p-12 xl:p-16 lg:border-r lg:border-border/50">
        <div className="flex items-center gap-2">
          <Link href="/creators" className="flex items-center gap-2.5 transition-all hover:scale-105">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 p-2 ring-1 ring-primary/20 backdrop-blur-md">
              <Image src="/logo.webp" alt="Creonex" width={32} height={32} className="size-full object-contain" priority />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">Creonex</span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[500px] flex-col items-center text-center justify-center py-16 lg:py-0">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
            <FontAwesomeIcon icon={faBolt} className="size-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Creator Edition</span>
          </div>
          <h1 className="mb-10 font-display text-3xl font-medium leading-snug tracking-tight text-foreground sm:text-4xl lg:text-3xl xl:text-4xl">
            Creonex makes monetizing easy. From quick 1:1s to full digital products, it's fast, smooth, and built for your growth.
          </h1>

          <div className="flex flex-col items-center gap-3">
            <div className="size-14 overflow-hidden rounded-full ring-2 ring-background shadow-md">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Creator" className="size-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Jason Rivera</p>
              <p className="text-xs text-muted-foreground">Product Designer, NovaByte</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block text-sm text-muted-foreground/60">
          © Creonex {new Date().getFullYear()}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center bg-background p-4 sm:p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] hidden lg:block" />

        <div className="w-full max-w-[440px] relative z-10">
          <div className="rounded-[2rem] border border-border/50 bg-background/80 p-8 shadow-2xl shadow-primary/5 backdrop-blur-2xl sm:p-10 text-center">
            <div className="mx-auto mb-6 flex items-center justify-center gap-2">
              <Image src="/logo.webp" alt="Creonex" width={28} height={28} className="object-contain" />
              <span className="font-display text-xl font-bold tracking-tight text-foreground">Creonex</span>
            </div>

            <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-foreground">
              Create and share your very first <span className="text-primary">Creonex</span> in no time!
            </h2>

            <Button
              onClick={handleGoogleSignUp}
              disabled={loading}
              variant="outline"
              className="h-12 w-full gap-3 rounded-xl border-border bg-background text-sm font-medium transition-colors hover:bg-foreground/5 shadow-sm mb-8"
            >
              <GoogleIcon />
              {loading ? 'Redirecting…' : 'Sign in with Google'}
            </Button>

            <div className="text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Why join as a creator?</p>
              <ul className="space-y-3">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <FontAwesomeIcon icon={faCheck} className="size-3 text-primary" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-left text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-medium text-foreground transition-colors hover:text-primary hover:underline underline-offset-4">
              Sign in
            </Link>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground/60 block lg:hidden">
            © Creonex {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
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
