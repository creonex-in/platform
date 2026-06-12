// All shared domain types live in @creonex/types.
// This file re-exports them so existing imports from '@/types/api' keep working.
export type {
  UserContext,
  CreatorProfile,
  LearnerProfile,
  AddCreatorRoleResponse,
  OnboardingStepResponse,
  GoLiveResponse,
} from '@creonex/types'

export type {
  LearnerStep1Data,
  CreatorStep1Data,
  CreatorStep2Data,
  CreatorStep3Data,
  Niche as NicheValue, // backwards-compat alias used in constants/onboarding.ts
  GoalType,
  OfferType,
} from '@creonex/types'
