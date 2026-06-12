import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsObject,
  IsArray,
  IsUrl,
  IsIn,
  MinLength,
  MaxLength,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import type { GoalType, Niche, OfferType } from '@creonex/types'

const GOAL_TYPES: GoalType[] = [
  'cat_prep',
  'job_switch',
  'skill_upgrade',
  'freelancing',
  'investing',
  'fitness',
  'other',
]

const VALID_NICHES: Niche[] = [
  'cat_mba_prep',
  'coding_dsa',
  'personal_finance',
  'fitness_nutrition',
  'design_creative',
  'language_learning',
  'digital_marketing',
  'music_arts',
  'upsc_govt_exams',
  'mental_wellness',
  'photography',
  'science_research',
  'real_estate',
  'writing_content',
  'ai_data_science',
  'gaming_esports',
  'cooking_food',
  'interview_prep',
  'ayurveda_yoga',
  'startup_product',
]

export class LearnerStep1Dto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  fullName?: string

  @ApiProperty({ enum: GOAL_TYPES })
  @IsEnum(GOAL_TYPES)
  goalType!: GoalType

  @ApiPropertyOptional({ type: [String], enum: VALID_NICHES })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsEnum(VALID_NICHES, { each: true })
  interestedNiches?: Niche[]
}

export class CreatorStep1Dto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  fullName!: string

  @ApiProperty({ enum: VALID_NICHES })
  @IsEnum(VALID_NICHES)
  primaryNiche!: Niche

  @ApiProperty({ minimum: 1, maximum: 20 })
  @IsNumber()
  @Min(1)
  @Max(20)
  experienceYears!: number
}

export class CreatorStep2Dto {
  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(150)
  bio!: string

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(30, { each: true })
  tags!: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  photoUrl?: string
}

const OFFER_TYPES: OfferType[] = ['one_on_one', 'workshop', 'group', 'digital']
const DURATION_OPTIONS = [30, 45, 60, 90] as const

export class CreatorStep3Dto {
  @ApiProperty({ enum: OFFER_TYPES })
  @IsEnum(OFFER_TYPES)
  offerType!: OfferType

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(80)
  title!: string

  @ApiProperty({ minimum: 99, description: 'Price in INR' })
  @IsNumber()
  @Min(99)
  price!: number

  @ApiPropertyOptional({ enum: DURATION_OPTIONS })
  @IsOptional()
  @IsEnum(DURATION_OPTIONS)
  durationMinutes?: 30 | 45 | 60 | 90

  @ApiPropertyOptional({ minimum: 2, maximum: 100, description: 'Max seats for group sessions' })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(100)
  seatsTotal?: number
}

const NICHE_CATEGORIES = [
  'exam_prep', 'professional_skills', 'health_wellness', 'creative_skills', 'undecided',
] as const

const CREDENTIAL_TYPES = [
  'verified_result', 'professional_exp', 'personal_transformation', 'community_teaching', 'deep_expertise',
] as const

const AUDIENCE_TYPES = [
  'exam_aspirants', 'working_professionals', 'health_lifestyle', 'aspiring_creatives', 'undefined_audience',
] as const

const PLATFORMS = [
  'instagram', 'whatsapp', 'telegram', 'youtube', 'multi_platform',
] as const

const CREATOR_GOALS = [
  'full_income', 'validate_grow', 'side_income', 'build_foundation', 'exploring',
] as const

export class CreatorQuestionsDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  fullName!: string

  @ApiProperty({ enum: NICHE_CATEGORIES })
  @IsIn([...NICHE_CATEGORIES])
  nicheCategory!: string

  @ApiProperty({ enum: CREDENTIAL_TYPES })
  @IsIn([...CREDENTIAL_TYPES])
  credentialType!: string

  @ApiProperty({ enum: AUDIENCE_TYPES })
  @IsIn([...AUDIENCE_TYPES])
  audienceType!: string

  @ApiProperty({ enum: PLATFORMS })
  @IsIn([...PLATFORMS])
  primaryPlatform!: string

  @ApiProperty({ enum: CREATOR_GOALS })
  @IsIn([...CREATOR_GOALS])
  creatorGoal!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  socialLinks?: {
    instagram?: string
    youtube?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
}
