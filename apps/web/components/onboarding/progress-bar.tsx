interface Props {
  currentStep: number
  totalSteps: number
  label: string
}

export function OnboardingProgressBar({
  currentStep,
  totalSteps,
  label,
}: Props): React.ReactElement {
  const pct = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
          {label}
        </span>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
