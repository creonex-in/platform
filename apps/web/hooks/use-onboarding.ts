'use client'
import { useMutation } from '@tanstack/react-query'
import { onboardingService } from '@/services/onboarding.service'
import type { LearnerStep1Data, CreatorStep1Data, CreatorStep2Data, CreatorStep3Data } from '@creonex/types'

export function useSaveLearnerStep1() {
  return useMutation({
    mutationFn: (data: LearnerStep1Data) => onboardingService.saveLearnerStep1(data),
  })
}

export function useSaveCreatorStep1() {
  return useMutation({
    mutationFn: (data: CreatorStep1Data) => onboardingService.saveCreatorStep1(data),
  })
}

export function useSaveCreatorStep2() {
  return useMutation({
    mutationFn: (data: CreatorStep2Data) => onboardingService.saveCreatorStep2(data),
  })
}

export function useSaveCreatorStep3() {
  return useMutation({
    mutationFn: (data: CreatorStep3Data) => onboardingService.saveCreatorStep3(data),
  })
}
