// ── Enums (runtime arrays — derive types from these, not the other way) ───────

export const NICHES = [
  'cat_mba_prep', 'coding_dsa', 'personal_finance', 'fitness_nutrition',
  'design_creative', 'language_learning', 'digital_marketing', 'music_arts',
  'upsc_govt_exams', 'mental_wellness', 'photography', 'science_research',
  'real_estate', 'writing_content', 'ai_data_science', 'gaming_esports',
  'cooking_food', 'interview_prep', 'ayurveda_yoga', 'startup_product',
] as const

export const GOAL_TYPES = [
  'cat_prep', 'job_switch', 'skill_upgrade',
  'freelancing', 'investing', 'fitness', 'other',
] as const

export const OFFER_TYPES = [
  'one_on_one', 'workshop', 'group', 'digital',
] as const

export const OFFER_STATUSES = [
  'draft', 'live', 'paused', 'archived',
] as const

export const KYC_STATUSES = [
  'not_started', 'pending', 'verified', 'failed',
] as const

export const ONBOARDING_STATUSES = [
  'not_started', 'in_progress', 'complete',
] as const

export const DURATION_OPTIONS = [30, 45, 60, 90] as const

// ── Types derived from arrays ─────────────────────────────────────────────────

export type Niche = typeof NICHES[number]
export type GoalType = typeof GOAL_TYPES[number]
export type OfferType = typeof OFFER_TYPES[number]
export type OfferStatus = typeof OFFER_STATUSES[number]
export type KycStatus = typeof KYC_STATUSES[number]
export type OnboardingStatus = typeof ONBOARDING_STATUSES[number]
export type DurationOption = typeof DURATION_OPTIONS[number]

// ── Step request shapes ───────────────────────────────────────────────────────

export interface LearnerStep1Request {
  fullName: string
  goalType: GoalType
}

export interface CreatorStep1Request {
  fullName: string
  primaryNiche: Niche
  experienceYears: number
}

export interface SocialLinks {
  youtube?: string
  linkedin?: string
  instagram?: string
  twitter?: string
  website?: string
}

export interface CreatorStep2Request {
  bio: string
  tags: string[]
  photoUrl?: string
  socialLinks?: SocialLinks
}

export interface CreatorStep3Request {
  bannerUrl?: string
  languages: string[]
}

export interface CreatorStep4Request {
  offerType: OfferType
  title: string
  price: number
  durationMinutes?: DurationOption
}

// Aliases — web app uses "Data" suffix
export type LearnerStep1Data = LearnerStep1Request
export type CreatorStep1Data = CreatorStep1Request
export type CreatorStep2Data = CreatorStep2Request
export type CreatorStep3Data = CreatorStep3Request
export type CreatorStep4Data = CreatorStep4Request
