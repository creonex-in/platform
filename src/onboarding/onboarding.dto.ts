import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsIn,
  IsUrl,
  Min,
  Max,
  MaxLength,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

const VALID_NICHES = [
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
] as const

// ── Learner ─────────────────────────────────────────────

export class LearnerStep1Dto {
  @ApiProperty({ example: 'Priya Sharma', minLength: 2, maxLength: 60 })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  fullName: string

  @ApiProperty({
    enum: ['cat_prep', 'job_switch', 'skill_upgrade', 'freelancing', 'investing', 'fitness', 'other'],
    example: 'skill_upgrade',
  })
  @IsEnum([
    'cat_prep', 'job_switch', 'skill_upgrade',
    'freelancing', 'investing', 'fitness', 'other',
  ])
  goalType: string
}

// ── Creator ──────────────────────────────────────────────

export class CreatorStep1Dto {
  @ApiProperty({ example: 'Rahul Sharma', minLength: 2, maxLength: 60 })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  fullName: string

  @ApiProperty({ enum: VALID_NICHES, example: 'coding_dsa' })
  @IsEnum(VALID_NICHES)
  primaryNiche: string

  @ApiProperty({ example: 3, minimum: 1, maximum: 20 })
  @IsNumber()
  @Min(1)
  @Max(20)
  experienceYears: number
}

export class CreatorStep2Dto {
  @ApiProperty({
    example: 'I help students crack DSA interviews at FAANG.',
    minLength: 20,
    maxLength: 150,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(150)
  bio: string

  @ApiProperty({
    type: [String],
    example: ['LeetCode', 'System Design', 'Java'],
    minItems: 1,
    maxItems: 5,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(30, { each: true })
  tags: string[]

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/example/photo.jpg' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string
}

export class CreatorStep3Dto {
  @ApiProperty({ enum: ['one_on_one', 'workshop', 'group', 'digital'], example: 'one_on_one' })
  @IsEnum(['one_on_one', 'workshop', 'group', 'digital'])
  offerType: string

  @ApiProperty({ example: 'DSA Mock Interview — LC Hard', minLength: 5, maxLength: 60 })
  @IsString()
  @MinLength(5)
  @MaxLength(60)
  title: string

  @ApiProperty({ example: 999, minimum: 99, description: 'Price in INR (rupees)' })
  @IsNumber()
  @Min(99)
  price: number

  @ApiPropertyOptional({ enum: [30, 45, 60, 90], example: 60, description: 'Session duration in minutes' })
  @IsOptional()
  @IsNumber()
  @IsIn([30, 45, 60, 90])
  durationMinutes?: number
}
