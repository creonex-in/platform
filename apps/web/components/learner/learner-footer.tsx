'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function LearnerFooter(): React.ReactElement {
  const router = useRouter()

  async function logout(): Promise<void> {
    await authClient.signOut()
    router.push('/sign-in')
  }

  return (
    <footer className="mt-auto hidden border-t border-border/60 bg-background/60 md:block">
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between px-6 text-xs">
        <span className="font-semibold uppercase tracking-wider text-muted-foreground">
          Creonex <span className="text-primary/80">Learner</span>
        </span>
        <div className="flex items-center gap-5 font-medium text-muted-foreground">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">Switch to Creator</Link>
          <Link href="/learner/account" className="transition-colors hover:text-foreground">Settings</Link>
          <button type="button" onClick={logout} className="transition-colors hover:text-destructive">Log out</button>
        </div>
      </div>
    </footer>
  )
}
