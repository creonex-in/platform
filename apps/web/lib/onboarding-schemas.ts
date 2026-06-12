import { z } from 'zod'
import {
  OFFER_TYPES,
  DURATION_OPTIONS,
  NICHE_CATEGORIES,
  CREDENTIAL_TYPES,
  AUDIENCE_TYPES,
  PLATFORM_TYPES,
  CREATOR_GOALS,
} from '@creonex/types'

// Step 1 = creator discovery questions (name + 5 discovery answers)
export const creatorStep1Schema = z.object({
  fullName: z.string().min(2, 'At least 2 characters').max(60, 'Max 60 characters'),
  nicheCategory: z.enum(NICHE_CATEGORIES),
  credentialType: z.enum(CREDENTIAL_TYPES),
  audienceType: z.enum(AUDIENCE_TYPES),
  primaryPlatform: z.enum(PLATFORM_TYPES),
  creatorGoal: z.enum(CREATOR_GOALS),
})

const urlOrEmpty = z.string().url('Must be a valid URL').or(z.literal('')).optional()

export const creatorStep2Schema = z.object({
  bio: z.string().min(20, 'Bio must be at least 20 characters').max(2000, 'Bio is too long'),
  tags: z.array(z.string().min(1).max(30)).min(1, 'Add at least one tag').max(5),
  photoUrl: z.string().url().optional(),
  socialLinks: z.object({
    youtube: urlOrEmpty,
    linkedin: urlOrEmpty,
    instagram: urlOrEmpty,
    twitter: urlOrEmpty,
    website: urlOrEmpty,
  }).optional(),
})

export const creatorStep3Schema = z.object({
  bannerUrl: z.string().optional(),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
})

export const creatorStep4Schema = z.object({
  offerType: z.enum(OFFER_TYPES),
  title: z.string().min(5, 'Title too short').max(80),
  price: z.number().min(299, 'Minimum ₹299'),
  durationMinutes: z.union(DURATION_OPTIONS.map((val) => z.literal(val)) as [z.ZodLiteral<30>, z.ZodLiteral<45>, z.ZodLiteral<60>, z.ZodLiteral<90>]).optional(),
})

export type CreatorStep1Form = z.infer<typeof creatorStep1Schema>
export type CreatorStep2Form = z.infer<typeof creatorStep2Schema>
export type CreatorStep3Form = z.infer<typeof creatorStep3Schema>
export type CreatorStep4Form = z.infer<typeof creatorStep4Schema>
