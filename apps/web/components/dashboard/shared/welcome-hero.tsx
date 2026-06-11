import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface HeroStat {
  label: string
  value: string
}

interface WelcomeHeroProps {
  name: string
  initials: string
  subtitle: string
  stats?: HeroStat[]
  action?: React.ReactNode
}

function getGreeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function WelcomeHero({
  name,
  initials,
  subtitle,
  stats,
  action,
}: WelcomeHeroProps): React.ReactElement {
  const greeting = getGreeting()
  const firstName = name.split(' ')[0]

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-12 sm:size-14">
            <AvatarFallback className="bg-secondary text-base font-semibold text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {greeting}, {firstName}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {subtitle}
            </p>
          </div>
        </div>

        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-x-12 gap-y-5 border-t border-border pt-6">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                {s.value}
              </p>
              <p className="text-sm tracking-wide text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
