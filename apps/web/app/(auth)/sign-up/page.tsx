import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faGraduationCap,
  faBolt,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons'

export const metadata: Metadata = {
  title: 'Sign Up — Creonex',
  description: 'Create your Creonex account as a learner or creator.',
}

const LEARNER_PERKS = [
  'Book 1:1 sessions with verified experts',
  'Join live workshops & group learning',
  'Find mentors across 20+ niches',
  'Cancel or reschedule anytime',
]

const CREATOR_PERKS = [
  '14-day discovery boost for new creators',
  'Offer 1:1s, workshops & digital products',
  'Keep 85% of every booking',
  'Your own profile page from day one',
]

export default function SignUpPage(): React.ReactElement {
  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-hidden selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_20%,rgba(59,130,246,0.10),transparent),radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(0,137,123,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,#000_60%,transparent_100%)]" />

      <header className="relative z-10 flex justify-center pt-8 pb-2 shrink-0">
        <Link href="/" className="group flex items-center gap-2.5 transition-transform hover:scale-105">
          <div className="flex size-9 items-center justify-center rounded-xl bg-foreground/5 p-1.5 ring-1 ring-foreground/10 backdrop-blur-sm transition-all group-hover:ring-foreground/20">
            <Image src="/logo.webp" alt="Creonex" width={28} height={28} className="size-full object-contain" priority />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            creo<span className="text-primary">nex</span>
          </span>
        </Link>
      </header>

      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-6 pb-2 shrink-0">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Choose your path
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          Are you here to learn from experts, or to share your knowledge and earn?
        </p>
      </div>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* LEARNER */}
        <Link
          href="/sign-up/learner"
          className="group flex-1 flex flex-col rounded-2xl lg:rounded-r-none border border-blue-500/20 bg-blue-500/[0.03] backdrop-blur-xl p-7 lg:p-10 shadow-xl shadow-blue-500/5 transition-all hover:border-blue-500/40 hover:bg-blue-500/[0.07] hover:shadow-blue-500/10 hover:-translate-y-0.5"
        >
          <div className="flex flex-col h-full max-w-xs mx-auto w-full space-y-6">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
              <FontAwesomeIcon icon={faGraduationCap} className="size-3 text-blue-500" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Learner</span>
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-xl font-bold tracking-tight leading-snug">Start learning from the best</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">One click to discover top experts and level up your skills.</p>
            </div>
            <ul className="space-y-2.5 flex-1">
              {LEARNER_PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                    <FontAwesomeIcon icon={faCheck} className="size-2.5 text-blue-500" />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all">
              Get started as Learner
              <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
            </div>
          </div>
        </Link>

        {/* DIVIDER */}
        <div className="lg:hidden flex items-center gap-3 px-2">
          <div className="flex-1 h-px bg-border/60" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border/60" />
        </div>
        <div className="hidden lg:flex flex-col items-center justify-center px-px">
          <div className="flex-1 w-px bg-border/60" />
          <span className="my-4 rounded-full border border-border bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">or</span>
          <div className="flex-1 w-px bg-border/60" />
        </div>

        {/* CREATOR */}
        <Link
          href="/sign-up/creator"
          className="group flex-1 flex flex-col rounded-2xl lg:rounded-l-none border border-primary/20 bg-primary/[0.03] backdrop-blur-xl p-7 lg:p-10 shadow-xl shadow-primary/5 transition-all hover:border-primary/40 hover:bg-primary/[0.07] hover:shadow-primary/10 hover:-translate-y-0.5"
        >
          <div className="flex flex-col h-full max-w-xs mx-auto w-full space-y-6">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
              <FontAwesomeIcon icon={faBolt} className="size-3 text-primary" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-primary">Creator</span>
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-xl font-bold tracking-tight leading-snug">Turn your knowledge into income</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Set up your profile in minutes and start earning from day one.</p>
            </div>
            <ul className="space-y-2.5 flex-1">
              {CREATOR_PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <FontAwesomeIcon icon={faCheck} className="size-2.5 text-primary" />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
              Get started as Creator
              <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
            </div>
          </div>
        </Link>
      </main>

      <footer className="relative z-10 flex flex-col items-center gap-2 pb-8 shrink-0">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-foreground transition-colors hover:text-primary underline-offset-4 hover:underline">Sign in</Link>
        </p>
        <p className="text-xs text-muted-foreground/60 text-center px-4">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-muted-foreground transition-colors">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-muted-foreground transition-colors">Privacy Policy</Link>.
        </p>
      </footer>
    </div>
  )
}
