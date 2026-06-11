import { z } from 'zod'

const NICHES = [
  'cat_mba_prep', 'coding_dsa', 'personal_finance', 'fitness_nutrition',
  'design_creative', 'language_learning', 'digital_marketing', 'music_arts',
  'upsc_govt_exams', 'mental_wellness', 'photography', 'science_research',
  'real_estate', 'writing_content', 'ai_data_science', 'gaming_esports',
  'cooking_food', 'interview_prep', 'ayurveda_yoga', 'startup_product',
] as const

const GOALS = [
  'cat_prep', 'job_switch', 'skill_upgrade',
  'freelancing', 'investing', 'fitness', 'other',
] as const

export const learnerStep1Schema = z.object({
  fullName: z.string().min(2, 'Enter your name').max(60),
  goalType: z.enum(GOALS),
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
  offerType: z.enum(['one_on_one', 'workshop', 'group', 'digital'] as const),
  title: z.string().min(5, 'Title too short').max(60),
  price: z.number().min(99, 'Minimum price is ₹99'),
  durationMinutes: z.number().int().min(15).optional(),
})

export type LearnerStep1Form = z.infer<typeof learnerStep1Schema>
export type CreatorStep1Form = z.infer<typeof creatorStep1Schema>
export type CreatorStep2Form = z.infer<typeof creatorStep2Schema>
export type CreatorStep3Form = z.infer<typeof creatorStep3Schema>
