import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsUrl,
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
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  fullName!: string

  @ApiProperty({ enum: GOAL_TYPES })
  @IsEnum(GOAL_TYPES)
  goalType!: GoalType
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
  @MaxLength(60)
  title!: string

  @ApiProperty({ minimum: 99, description: 'Price in INR' })
  @IsNumber()
  @Min(99)
  price!: number

  @ApiPropertyOptional({ enum: DURATION_OPTIONS })
  @IsOptional()
  @IsEnum(DURATION_OPTIONS)
  durationMinutes?: 30 | 45 | 60 | 90
}
