import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCompass, faCalendarDays, faBookOpen, faArrowRight, faBullseye,
} from '@fortawesome/free-solid-svg-icons'
import { requireLearner } from '@/lib/auth-guards'
import { getLearnerOverview } from '@/dal/learner.dal'
import { PageShell, SectionHeading, EmptyState } from '@/components/learner/shared'
import { SessionCard } from '@/components/learner/session-card'
import { DigitalCard } from '@/components/learner/digital-card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata = { title: 'My Learning — Creonex' }

function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const QUICK = [
  {
    label: 'Explore Creators',
    description: 'Find top creators and mentors',
    href: '/explore',
    icon: faCompass,
    bgGlow: 'from-pink-500/10 to-transparent',
    borderColor: 'hover:border-pink-500/30',
    iconColor: 'text-pink-500',
  },
  {
    label: 'Weekly Schedule',
    description: 'Manage bookings and calendar',
    href: '/learner/schedule',
    icon: faCalendarDays,
    bgGlow: 'from-purple-500/10 to-transparent',
    borderColor: 'hover:border-purple-500/30',
    iconColor: 'text-purple-500',
  },
  {
    label: 'Digital Library',
    description: 'Access files and materials',
    href: '/learner/library',
    icon: faBookOpen,
    bgGlow: 'from-blue-500/10 to-transparent',
    borderColor: 'hover:border-blue-500/30',
    iconColor: 'text-blue-500',
  },
]

export default async function LearnerHomePage(): Promise<React.ReactElement> {
  const [user, overview] = await Promise.all([requireLearner(), getLearnerOverview()])
  const firstName = (user.name ?? user.email).split(' ')[0]

  return (
    <PageShell>
      {/* Greeting Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-linear-to-r from-primary/5 via-purple-500/5 to-background p-6 sm:p-8 mb-8 shadow-xs">
        <div className="absolute right-0 top-0 -z-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-10 bottom-0 -z-10 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl" />
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {greeting()}, <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">{firstName}</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Welcome back to your learning space. You have <span className="text-foreground font-semibold">{overview.upcomingCount} upcoming session(s)</span> scheduled.
        </p>
      </div>

      {/* Quick actions */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className={cn(
              "group relative overflow-hidden flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
              q.borderColor
            )}
          >
            {/* Hover background gradient glow */}
            <div className={cn("absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100", q.bgGlow)} />
            
            <div>
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-muted/60 transition-colors group-hover:bg-background">
                <FontAwesomeIcon icon={q.icon} className={cn("size-5 transition-transform duration-300 group-hover:scale-110", q.iconColor)} />
              </div>
              <h3 className="text-sm font-bold text-foreground sm:text-base">{q.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{q.description}</p>
            </div>
            
            {/* Arrow icon shown on hover */}
            <div className="absolute right-4 top-4 opacity-0 transition-all duration-300 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
              <FontAwesomeIcon icon={faArrowRight} className="size-3 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>

      {/* Next up */}
      <section className="mb-10">
        <SectionHeading
          title="Next up"
          subtitle={overview.upcomingCount > 1 ? `${overview.upcomingCount} upcoming` : undefined}
          action={
            overview.nextSession ? (
              <Link href="/learner/schedule" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                All sessions <FontAwesomeIcon icon={faArrowRight} className="size-3" />
              </Link>
            ) : undefined
          }
        />
        {overview.nextSession ? (
          <SessionCard booking={overview.nextSession} />
        ) : (
          <EmptyState
            icon={faCalendarDays}
            title="No upcoming sessions"
            description="Book a 1:1 or join a workshop to get started."
            action={<Link href="/explore" className={cn(buttonVariants({ size: 'sm' }), 'rounded-lg')}>Explore creators</Link>}
          />
        )}
      </section>

      {/* Continue (recent digital) */}
      {overview.recentDigital.length > 0 && (
        <section className="mb-10">
          <SectionHeading
            title="Continue"
            action={
              <Link href="/learner/library" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Library <FontAwesomeIcon icon={faArrowRight} className="size-3" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {overview.recentDigital.map((b) => <DigitalCard key={b.id} booking={b} />)}
          </div>
        </section>
      )}

      {/* Goals snapshot */}
      <section>
        <SectionHeading
          title="Your goals"
          action={
            <Link href="/learner/growth" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Manage <FontAwesomeIcon icon={faArrowRight} className="size-3" />
            </Link>
          }
        />
        {overview.activeGoals.length > 0 ? (
          <div className="space-y-2">
            {overview.activeGoals.slice(0, 3).map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  <FontAwesomeIcon icon={faBullseye} className="size-3.5" />
                </span>
                <p className="text-sm font-medium text-foreground">{g.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={faBullseye}
            title="No goals yet"
            description="Set a goal to keep your learning focused."
            action={<Link href="/learner/growth" className={cn(buttonVariants({ size: 'sm' }), 'rounded-lg')}>Add a goal</Link>}
          />
        )}
      </section>
    </PageShell>
  )
}
