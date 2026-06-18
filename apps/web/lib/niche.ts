import { NICHE_OPTIONS } from '@/constants/onboarding'

const LABEL_BY_VALUE = new Map(NICHE_OPTIONS.map((n) => [n.value as string, n.label]))

/** Human label for a niche enum value (e.g. `coding_dsa` → "Coding & DSA"). */
export function nicheLabel(value?: string | null): string {
  if (!value) return ''
  return LABEL_BY_VALUE.get(value) ?? value
}

/** The niches surfaced as quick-pick tiles on the explore browse state. */
export const FEATURED_NICHES = [
  'coding_dsa', 'design_creative', 'ai_data_science', 'personal_finance',
  'digital_marketing', 'startup_product', 'fitness_nutrition', 'writing_content',
] as const
