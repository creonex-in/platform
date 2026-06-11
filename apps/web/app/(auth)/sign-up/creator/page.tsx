'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCheck, faBolt } from '@fortawesome/free-solid-svg-icons'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

const PERKS = [
  '14-day discovery boost to get your first students',
  'Offer 1:1s, workshops, group sessions & digital products',
  'Keep 85% of every booking — lowest fees in the market',
  'Your own public profile page from day one',
]

export default function CreatorSignUpPage(): React.ReactElement {
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignUp() {
    setLoading(true)
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/sign-in/redirect?intent=creator',
    })
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <Link
        href="/sign-up"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
        Back
      </Link>

      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1">
          <FontAwesomeIcon icon={faBolt} className="size-3 text-primary" />
          <span className="text-[0.7rem] font-semibold text-primary">Creator</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Turn your knowledge into income
        </h1>
        <p className="text-sm text-muted-foreground">
          Set up your creator profile in minutes and start earning.
        </p>
      </div>

      <ul className="space-y-2.5">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <FontAwesomeIcon icon={faCheck} className="size-2.5 text-primary" />
            </span>
            {perk}
          </li>
        ))}
      </ul>

      <Button
        onClick={handleGoogleSignUp}
        disabled={loading}
        variant="outline"
        className="w-full h-11 gap-3 text-sm font-medium"
      >
        <GoogleIcon />
        {loading ? 'Redirecting…' : 'Continue with Google'}
      </Button>

      <p className="text-center text-[0.8125rem] text-muted-foreground">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-primary transition-colors hover:text-primary/80">
          Sign in
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}
