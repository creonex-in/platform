'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBolt,
  faCheck,
  faClone,
  faImage,
  faLink,
  faRocket,
  faStar,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'

export default function CreatorCompletePage(): React.ReactElement {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('creonex_ob_complete')
      if (raw) {
        const { username: u } = JSON.parse(raw) as { username: string }
        setUsername(u)
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`https://creonex.in/${username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-8">
      {/* Checkmark ring */}
      <div className="relative mx-auto flex size-16 items-center justify-center">
        <svg viewBox="0 0 64 64" fill="none" className="absolute inset-0 size-full -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            className="text-primary"
            strokeDasharray="125.66"
            strokeDashoffset="0"
            strokeLinecap="round"
          />
        </svg>
        <FontAwesomeIcon icon={faCheck} className="size-6 text-primary" />
      </div>

      <h1 className="text-center font-display text-2xl font-bold tracking-tight">
        Your profile is live! 🚀
      </h1>

      {/* Profile URL */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-muted px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <FontAwesomeIcon icon={faLink} className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-mono text-sm">creonex.in/{username}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          <FontAwesomeIcon icon={copied ? faCheck : faClone} className="size-4" />
        </button>
      </div>

      {/* Action cards */}
      <div className="space-y-2">
        <Link href="/creator/edit-profile" className="action-card flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 transition-colors hover:bg-accent">
          <FontAwesomeIcon icon={faImage} className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Add a profile photo</p>
            <p className="text-xs text-muted-foreground">Profiles with photos get 3× more bookings</p>
          </div>
        </Link>
        <Link href="/creator" className="action-card flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 transition-colors hover:bg-accent">
          <FontAwesomeIcon icon={faStar} className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Complete your first session</p>
            <p className="text-xs text-muted-foreground">Accept bookings and start earning</p>
          </div>
        </Link>
        <div className="action-card flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5">
          <FontAwesomeIcon icon={faBolt} className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Respond within 1 hour</p>
            <p className="text-xs text-muted-foreground">Fast responses boost your ranking in discovery</p>
          </div>
        </div>
      </div>

      <div>
        <Button className="w-full gap-2" onClick={() => router.push('/creator')}>
          <FontAwesomeIcon icon={faRocket} className="size-4" />
          Go to my creator dashboard
          <FontAwesomeIcon icon={faArrowRight} className="size-4" />
        </Button>
      </div>
    </div>
  )
}
