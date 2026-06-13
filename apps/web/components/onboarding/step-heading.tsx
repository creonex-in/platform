interface Props {
  /** Shown only on mobile (the desktop rail already shows the journey). */
  stepLabel: string
  title: string
  subtitle: string
}

export function StepHeading({ stepLabel, title, subtitle }: Props): React.ReactElement {
  return (
    <div className="space-y-3 mb-2">
      <p className="text-xs font-bold uppercase tracking-widest text-primary lg:hidden">
        {stepLabel}
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="text-base text-muted-foreground leading-relaxed">{subtitle}</p>
    </div>
  )
}
