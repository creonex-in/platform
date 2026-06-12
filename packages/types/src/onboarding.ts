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

// ── Creator discovery questions (step-1) ──────────────────────────────────────

export const NICHE_CATEGORIES = [
  'exam_prep', 'professional_skills', 'health_wellness', 'creative_skills', 'undecided',
] as const

export const CREDENTIAL_TYPES = [
  'verified_result', 'professional_exp', 'personal_transformation',
  'community_teaching', 'deep_expertise',
] as const

export const AUDIENCE_TYPES = [
  'exam_aspirants', 'working_professionals', 'health_lifestyle',
  'aspiring_creatives', 'undefined_audience',
] as const

export const PLATFORM_TYPES = [
  'instagram', 'whatsapp', 'telegram', 'youtube', 'multi_platform',
] as const

export const CREATOR_GOALS = [
  'full_income', 'validate_grow', 'side_income', 'build_foundation', 'exploring',
] as const

// ── Types derived from arrays ─────────────────────────────────────────────────

export type Niche = typeof NICHES[number]
export type GoalType = typeof GOAL_TYPES[number]
export type OfferType = typeof OFFER_TYPES[number]
export type OfferStatus = typeof OFFER_STATUSES[number]
export type KycStatus = typeof KYC_STATUSES[number]
export type OnboardingStatus = typeof ONBOARDING_STATUSES[number]
export type DurationOption = typeof DURATION_OPTIONS[number]
export type NicheCategory = typeof NICHE_CATEGORIES[number]
export type CredentialType = typeof CREDENTIAL_TYPES[number]
export type AudienceType = typeof AUDIENCE_TYPES[number]
export type PlatformType = typeof PLATFORM_TYPES[number]
export type CreatorGoal = typeof CREATOR_GOALS[number]

// ── Step request shapes ───────────────────────────────────────────────────────

export interface LearnerStep1Request {
  fullName?: string
  goalType: GoalType
  interestedNiches?: string[]
}

/** Step 1 = creator discovery questions (name + 5 discovery answers) */
export interface CreatorStep1Request {
  fullName: string
  nicheCategory: NicheCategory
  credentialType: CredentialType
  audienceType: AudienceType
  primaryPlatform: PlatformType
  creatorGoal: CreatorGoal
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
