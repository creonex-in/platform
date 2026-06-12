import { z } from 'zod'
import { NICHES, GOAL_TYPES, OFFER_TYPES, DURATION_OPTIONS } from '@creonex/types'

export const learnerStep1Schema = z.object({
  fullName: z.string().min(2, 'Enter your name').max(60),
  goalType: z.enum(GOAL_TYPES),
})

export const creatorStep1Schema = z.object({
  fullName: z.string().min(2, 'Enter your name').max(60),
  primaryNiche: z.enum(NICHES),
  experienceYears: z.number().min(1).max(20),
})

export const creatorStep2Schema = z.object({
  bio: z.string().min(20, 'Bio must be at least 20 characters').max(150),
  tags: z.array(z.string().min(1).max(30)).min(1, 'Add at least one tag').max(5),
  photoUrl: z.string().url().optional(),
})

export const creatorStep3Schema = z.object({
  offerType: z.enum(OFFER_TYPES),
  title: z.string().min(5, 'Title too short').max(60),
  price: z.number().min(99, 'Minimum price is ₹99'),
  durationMinutes: z.union(DURATION_OPTIONS.map(z.literal) as [z.ZodLiteral<30>, z.ZodLiteral<45>, z.ZodLiteral<60>, z.ZodLiteral<90>]).optional(),
})

export type LearnerStep1Form = z.infer<typeof learnerStep1Schema>
export type CreatorStep1Form = z.infer<typeof creatorStep1Schema>
export type CreatorStep2Form = z.infer<typeof creatorStep2Schema>
export type CreatorStep3Form = z.infer<typeof creatorStep3Schema>
