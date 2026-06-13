'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faGraduationCap } from '@fortawesome/free-solid-svg-icons'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

const PERKS = [
  'Book 1:1 sessions with verified experts',
  'Join live workshops & group learning',
  'Find mentors in 20+ niches',
  'Cancel or reschedule anytime',
]

function mapAuthError(error: { message?: string; status?: number; code?: string }): string {
  if (error.status === 429) return 'Too many attempts. Wait a moment and try again.'
  if (error.status === 500) return 'Server error. Please try again in a moment.'
  return error.message ?? 'Something went wrong. Please try again.'
}

export default function LearnerSignUpPage(): React.ReactElement {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleSignUp() {
    setLoading(true)
    setError(null)
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${process.env.NEXT_PUBLIC_WEB_URL}/api/post-oauth?intent=learner`,
      })
      if (error) {
        setError(mapAuthError(error))
        setLoading(false)
      }
      // on success: browser redirects — don't reset loading
    } catch {
      setError('Unable to connect. Check your internet and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* LEFT SIDE */}
      <div className="relative flex flex-1 flex-col justify-between bg-[linear-gradient(to_bottom_right,rgba(59,130,246,0.05),rgba(59,130,246,0.01))] p-8 lg:p-12 xl:p-16 lg:border-r lg:border-border/50">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 transition-all hover:scale-105">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 p-2 ring-1 ring-blue-500/20 backdrop-blur-md">
              <Image src="/logo.webp" alt="Creonex" width={32} height={32} className="size-full object-contain" priority />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">Creonex</span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-125 flex-col items-center text-center justify-center py-16 lg:py-0">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5">
            <FontAwesomeIcon icon={faGraduationCap} className="size-3.5 text-blue-500" />
            <span className="text-xs font-semibold text-blue-500">Learner Edition</span>
          </div>
          <h1 className="mb-10 font-display text-3xl font-medium leading-snug tracking-tight text-foreground sm:text-4xl lg:text-3xl xl:text-4xl">
            Learn directly from the world's best experts. Fast, engaging, and personalized just for you.
          </h1>
          
          <div className="flex flex-col items-center gap-3">
            <div className="size-14 overflow-hidden rounded-full ring-2 ring-background shadow-md">
              <img src="https://i.pravatar.cc/150?u=4" alt="Learner" className="size-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Sarah Jenkins</p>
              <p className="text-xs text-muted-foreground">Product Design Student</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block text-sm text-muted-foreground/60">
          © Creonex {new Date().getFullYear()}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center bg-background p-4 sm:p-8 lg:p-12 relative overflow-hidden">
        {/* Subtle grid pattern behind the card */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] hidden lg:block" />
        
        <div className="w-full max-w-110 relative z-10">
          <div className="rounded-4xl border border-border/50 bg-background/80 p-8 shadow-2xl shadow-blue-500/5 backdrop-blur-2xl sm:p-10 text-center">
            <div className="mx-auto mb-6 flex items-center justify-center gap-2">
               <Image src="/logo.webp" alt="Creonex" width={28} height={28} className="object-contain" />
               <span className="font-display text-xl font-bold tracking-tight text-foreground">Creonex</span>
            </div>
            
            <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-foreground">
              Discover and learn from top experts on <span className="text-blue-500">Creonex</span>!
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
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Why join as a learner?</p>
              <ul className="space-y-3">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                      <FontAwesomeIcon icon={faCheck} className="size-3 text-blue-500" />
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
             <Link href="/sign-in" className="font-medium text-foreground transition-colors hover:text-blue-500 hover:underline underline-offset-4">
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
