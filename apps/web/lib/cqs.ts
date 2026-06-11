export type CQSTier = 'rising' | 'verified' | 'elite'

export function getCQSTier(score: number): CQSTier {
  if (score >= 90) return 'elite'
  if (score >= 75) return 'verified'
  return 'rising'
}

export function getCQSColor(tier: CQSTier): string {
  return { elite: 'text-amber-500', verified: 'text-blue-500', rising: 'text-muted-foreground' }[tier]
}

export function getCQSBadgeVariant(tier: CQSTier): 'default' | 'secondary' | 'outline' {
  const map = { elite: 'default', verified: 'secondary', rising: 'outline' } as const
  return map[tier]
}
