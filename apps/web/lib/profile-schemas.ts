import { z } from 'zod'
import { NICHES, validateUsername } from '@creonex/types'

const urlOrEmpty = z.string().url('Must be a valid URL').or(z.literal('')).optional()

/**
 * Edit-profile form schema. Mirrors the onboarding field rules (creator step 1-3)
 * but as one flat object for the post-onboarding editor.
 */
export const editProfileSchema = z.object({
  displayName: z.string().min(2, 'At least 2 characters').max(60, 'Max 60 characters'),
  username: z.string().superRefine((val, ctx) => {
    const err = validateUsername(val)
    if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err })
  }),
  bio: z.string().min(20, 'Bio must be at least 20 characters').max(2000, 'Bio is too long'),
  primaryNiche: z.enum(NICHES),
  experienceYears: z.number().int('Whole number').min(0, 'Cannot be negative').max(60, 'Too high').optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().optional(),
  socialLinks: z.object({
    youtube: urlOrEmpty,
    linkedin: urlOrEmpty,
    instagram: urlOrEmpty,
    twitter: urlOrEmpty,
    website: urlOrEmpty,
  }),
  languages: z.array(z.string()).min(1, 'Select at least one language').max(12),
  tags: z.array(z.string().min(1).max(30)).min(1, 'Add at least one tag').max(5),
})

export type EditProfileForm = z.infer<typeof editProfileSchema>
