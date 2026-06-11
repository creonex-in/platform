export type GoalType =
  | 'cat_prep'
  | 'job_switch'
  | 'skill_upgrade'
  | 'freelancing'
  | 'investing'
  | 'fitness'
  | 'other'

export type Niche =
  | 'cat_mba_prep'
  | 'coding_dsa'
  | 'personal_finance'
  | 'fitness_nutrition'
  | 'design_creative'
  | 'language_learning'
  | 'digital_marketing'
  | 'music_arts'
  | 'upsc_govt_exams'
  | 'mental_wellness'
  | 'photography'
  | 'science_research'
  | 'real_estate'
  | 'writing_content'
  | 'ai_data_science'
  | 'gaming_esports'
  | 'cooking_food'
  | 'interview_prep'
  | 'ayurveda_yoga'
  | 'startup_product'

export type OfferType = 'one_on_one' | 'workshop' | 'group' | 'digital'

export type OfferStatus = 'draft' | 'live' | 'paused' | 'archived'

export type KycStatus = 'not_started' | 'pending' | 'verified' | 'failed'

export type OnboardingStatus = 'not_started' | 'in_progress' | 'complete'

export interface LearnerStep1Request {
  fullName: string
  goalType: GoalType
}

export interface CreatorStep1Request {
  fullName: string
  primaryNiche: Niche
  experienceYears: number
}

export interface CreatorStep2Request {
  bio: string
  tags: string[]
  photoUrl?: string
}

export interface CreatorStep3Request {
  offerType: OfferType
  title: string
  price: number
  durationMinutes?: 30 | 45 | 60 | 90
}

export interface OnboardingStepResponse {
  success: boolean
  nextStep?: number
  redirectTo?: string
}
