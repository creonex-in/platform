import type { UserRole } from './roles'
import type { Niche, GoalType } from './onboarding'

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  roles: UserRole[]
  onboardingComplete: boolean
  image?: string | null
}

export interface SessionResponse {
  user: AuthUser
  session: {
    id: string
    expiresAt: string
  }
}

// ── User ─────────────────────────────────────────────────────────────────────

/** Shape returned by GET /api/v1/users/me */
export interface UserContext {
  id: string
  email: string
  name: string
  /** Comma-separated roles: "learner" | "learner,creator" */
  role: string
  image: string | null
}

// ── Creator Profile ───────────────────────────────────────────────────────────

/** Shape returned by GET /api/v1/users/me/creator-profile */
export interface CreatorProfile {
  id: string
  userId: string
  username: string | null
  displayName: string | null
  bio: string | null
  profilePhotoUrl: string | null
  primaryNiche: Niche | null
  experienceYears: number | null
  qualityScore: string
  qualityTier: string
  isLive: boolean
  inDiscoveryBoost: boolean
  boostEndDate: string | null
  onboardingStatus: string
  currentStep: number
}

// ── Learner Profile ───────────────────────────────────────────────────────────

/** Shape returned by GET /api/v1/users/me/learner-profile */
export interface LearnerProfile {
  id: string
  userId: string
  goalType: GoalType | null
  interestedNiches: string[]
  onboardingStatus: string
}

// ── Role Mutation ─────────────────────────────────────────────────────────────

export interface AddCreatorRoleResponse {
  success: boolean
  roles: UserRole[]
  redirectTo: string
  alreadyCreator?: boolean
}

// ── Onboarding Responses ──────────────────────────────────────────────────────

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
