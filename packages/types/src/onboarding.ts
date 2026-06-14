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

// ── Offer-type gating ─────────────────────────────────────────────────────────
// New creators can only create 1:1 sessions and digital products. Group calls and
// workshops/webinars unlock once they've delivered enough 1:1 sessions — this
// keeps quality high and proves the creator before they run group formats.
export const SESSIONS_TO_UNLOCK_OFFERS = 5

/** Offer types a creator can always create, from day one. */
export const ALWAYS_UNLOCKED_OFFER_TYPES = ['one_on_one', 'digital'] as const

/** Offer types gated behind completed 1:1 sessions. */
export const GATED_OFFER_TYPES = ['workshop', 'group'] as const

export const KYC_STATUSES = [
  'not_started', 'pending', 'verified', 'failed',
] as const

export const ONBOARDING_STATUSES = [
  'not_started', 'in_progress', 'complete',
] as const

export const DURATION_OPTIONS = [30, 45, 60, 90] as const

// ── Username (creator handle) ─────────────────────────────────────────────────

export const USERNAME_MIN = 3
export const USERNAME_MAX = 20

/** lowercase alphanumeric + single hyphens; must start & end alphanumeric */
export const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

export const RESERVED_USERNAMES = [
  'admin', 'api', 'app', 'auth', 'creonex', 'dashboard', 'onboarding',
  'login', 'logout', 'signup', 'signin', 'settings', 'about', 'help',
  'support', 'c', 'me', 'new', 'profile', 'explore', 'search',
] as const

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase()
}

/** Returns an error message, or null if the (normalized) handle is valid. */
export function validateUsername(input: string): string | null {
  const u = normalizeUsername(input)
  if (u.length < USERNAME_MIN) return `At least ${USERNAME_MIN} characters`
  if (u.length > USERNAME_MAX) return `Max ${USERNAME_MAX} characters`
  if (!USERNAME_REGEX.test(u)) return 'Use lowercase letters, numbers and hyphens'
  if ((RESERVED_USERNAMES as readonly string[]).includes(u)) return 'This handle is reserved'
  return null
}

// ── Creator discovery questions (step-1) ──────────────────────────────────────

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

/** Step 1 = creator discovery questions (name + handle + 5 discovery answers) */
export interface CreatorStep1Request {
  fullName: string
  username: string
  primaryNiche: Niche
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
  experienceYears?: number
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
