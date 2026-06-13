'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

const STEPS = [
  { n: 1, path: '/onboarding/creator/step-1', label: 'Identity', hint: 'Name, handle & niche' },
  { n: 2, path: '/onboarding/creator/step-2', label: 'Story', hint: 'Bio, photo & links' },
  { n: 3, path: '/onboarding/creator/step-3', label: 'Presence', hint: 'Banner & languages' },
  { n: 4, path: '/onboarding/creator/step-4', label: 'First offer', hint: 'Publish & go live' },
] as const

function currentStep(pathname: string): number {
  if (pathname.includes('/complete')) return 5
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (pathname.startsWith(STEPS[i].path)) return STEPS[i].n
  }
  return 1
}

export function OnboardingRail(): React.ReactElement {
  const pathname = usePathname()
  const active = currentStep(pathname)

  return (
    <aside className="relative hidden h-full w-[40%] max-w-sm shrink-0 flex-col justify-between overflow-hidden bg-[#0a0a0f] px-10 py-12 text-white xl:max-w-md lg:flex">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -left-24 -top-28 size-96 rounded-full bg-white/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 size-80 rounded-full bg-white/5 blur-[80px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Noise overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />

      {/* Brand + headline */}
      <div className="relative space-y-12 z-10">
        <Link href="/" className="flex items-center gap-2.5 text-white transition-opacity hover:opacity-80">
          <Image src="/logo.webp" alt="Creonex" width={30} height={30} className="size-7 object-contain drop-shadow-sm invert brightness-0" />
          <span className="font-display text-lg font-bold tracking-tight text-white">Creonex</span>
        </Link>

        <div className="space-y-4">
          <h1 className="font-display text-[32px] font-bold leading-[1.15] tracking-tight text-white">
            Your creator<br />business, live<br />in minutes.
          </h1>
          <p className="max-w-70 text-[15px] leading-relaxed text-white/55">
            Set up your profile, publish your first paid offering, and start taking bookings.
          </p>
        </div>
      </div>

      {/* Step journey */}
      <ol className="relative space-y-0 z-10 my-10">
        {STEPS.map((step, i) => {
          const done = active > step.n
          const isActive = active === step.n
          return (
            <li key={step.n} className="relative flex gap-5">
              {/* connector */}
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    'absolute left-3.75 top-8.5 h-[calc(100%-12px)] w-0.5 rounded-full',
                    done ? 'bg-white/40' : 'bg-white/10',
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-all duration-300',
                  done && 'bg-white text-black shadow-md shadow-white/40',
                  isActive && 'bg-white text-[#0a0a0f] ring-4 ring-white/10',
                  !done && !isActive && 'border-2 border-white/15 text-white/40 bg-[#0a0a0f]',
                )}
              >
                {done ? <FontAwesomeIcon icon={faCheck} className="size-3.5" /> : step.n}
              </span>
              <div className={cn('pb-7 transition-all duration-300', !isActive && !done && 'opacity-50')}>
                <p className={cn('text-[15px] font-semibold tracking-tight', isActive ? 'text-white' : 'text-white/80')}>
                  {step.label}
                </p>
                <p className="text-[13px] text-white/45 mt-0.5 font-medium">{step.hint}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="relative z-10 text-[13px] font-medium text-white/35">Everything here is editable later from your dashboard.</p>
    </aside>
  )
}
