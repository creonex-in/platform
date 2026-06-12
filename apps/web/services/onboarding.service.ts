import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type {
  LearnerStep1Data,
  CreatorStep1Data,
  CreatorStep2Data,
  CreatorStep3Data,
  OnboardingStepResponse,
  GoLiveResponse,
} from '@creonex/types'

export const onboardingService = {
  saveLearnerStep1: (data: LearnerStep1Data) =>
    api.post<OnboardingStepResponse>(endpoints.onboarding.learnerStep1, data),

  saveCreatorStep1: (data: CreatorStep1Data) =>
    api.post<OnboardingStepResponse>(endpoints.onboarding.creatorStep1, data),

  saveCreatorStep2: (data: CreatorStep2Data) =>
    api.post<OnboardingStepResponse>(endpoints.onboarding.creatorStep2, data),

  saveCreatorStep3: (data: CreatorStep3Data) =>
    api.post<GoLiveResponse>(endpoints.onboarding.creatorStep3, data),
}
