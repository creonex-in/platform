export type UserRole = 'learner' | 'creator'

export type NicheValue =
  | 'cat_mba_prep' | 'coding_dsa' | 'personal_finance'
  | 'fitness_nutrition' | 'design_creative' | 'language_learning'
  | 'digital_marketing' | 'music_arts' | 'upsc_govt_exams'
  | 'mental_wellness' | 'photography' | 'science_research'
  | 'real_estate' | 'writing_content' | 'ai_data_science'
  | 'gaming_esports' | 'cooking_food' | 'interview_prep'
  | 'ayurveda_yoga' | 'startup_product'

export type GoalType =
  | 'cat_prep' | 'job_switch' | 'skill_upgrade'
  | 'freelancing' | 'investing' | 'fitness' | 'other'

export type OfferType = 'one_on_one' | 'workshop' | 'group' | 'digital'

export interface UserContext {
  id: string
  email: string
  name: string
  role: string      // comma-separated: "learner" | "learner,creator"
  image: string | null
}

export interface CreatorProfile {
  id: string
  userId: string
  username: string | null
  displayName: string | null
  bio: string | null
  profilePhotoUrl: string | null
  primaryNiche: NicheValue | null
  experienceYears: number | null
  qualityScore: string
  qualityTier: string
  isLive: boolean
  inDiscoveryBoost: boolean
  boostEndDate: string | null
  onboardingStatus: string
  currentStep: number
}

export interface LearnerProfile {
  id: string
  userId: string
  goalType: GoalType | null
  interestedNiches: string[]
  onboardingStatus: string
}

export interface AddCreatorRoleResponse {
  success: boolean
  roles: UserRole[]
  redirectTo: string
  alreadyCreator?: boolean
}

export interface OnboardingStepResponse {
  success: boolean
  nextStep?: number
  redirectTo?: string
}

export interface GoLiveResponse {
  success: boolean
  username: string
  profileUrl: string
  offeringId: string
}

export interface LearnerStep1Data {
  fullName: string
  goalType: GoalType
}

export interface CreatorStep1Data {
  fullName: string
  primaryNiche: NicheValue
  experienceYears: number
}

export interface CreatorStep2Data {
  bio: string
  tags: string[]
  photoUrl?: string
}

export interface CreatorStep3Data {
  offerType: OfferType
  title: string
  price: number
  durationMinutes?: number
}
