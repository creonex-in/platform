'use client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { onboardingService } from '@/services/onboarding.service'
import { usersService } from '@/services/users.service'
import type { LearnerStep1Data, CreatorStep1Data, CreatorStep2Data, CreatorStep3Data, CreatorStep4Data } from '@creonex/types'

export function useCreatorProfile() {
  return useQuery({
    queryKey: ['creator-profile-me'],
    queryFn: () => usersService.getCreatorProfile(),
    staleTime: 60_000,
    retry: false,
  })
}

/** Live handle availability. Pass a debounced, format-valid username + enabled flag. */
export function useUsernameAvailability(username: string, enabled: boolean) {
  return useQuery({
    queryKey: ['username-available', username],
    queryFn: () => onboardingService.checkUsername(username),
    enabled,
    staleTime: 30_000,
    retry: false,
  })
}

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

export function useSaveCreatorStep4() {
  return useMutation({
    mutationFn: (data: CreatorStep4Data) => onboardingService.saveCreatorStep4(data),
  })
}
