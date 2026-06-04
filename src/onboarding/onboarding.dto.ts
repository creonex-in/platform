import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsIn,
  Min,
  Max,
  MaxLength,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

// ── Learner ─────────────────────────────────────────────

export class LearnerStep1Dto {
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

export class LearnerStep2Dto {
  @ApiProperty({
    type: [String],
    enum: ['dsa_coding', 'cat_prep', 'personal_finance', 'ui_ux_design', 'system_design', 'fitness', 'content_creation', 'product_management', 'data_science', 'other'],
    example: ['dsa_coding', 'system_design'],
    minItems: 1,
    maxItems: 3,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsEnum([
    'dsa_coding', 'cat_prep', 'personal_finance',
    'ui_ux_design', 'system_design', 'fitness',
    'content_creation', 'product_management',
    'data_science', 'other',
  ], { each: true })
  niches: string[]

  @ApiPropertyOptional({
    enum: ['under_500', '500_1000', '1000_2000', 'above_2000', 'flexible'],
    example: '1000_2000',
  })
  @IsOptional()
  @IsEnum([
    'under_500', '500_1000', '1000_2000',
    'above_2000', 'flexible',
  ])
  budgetRange?: string
}

// ── Creator ──────────────────────────────────────────────

export class CreatorStep1Dto {
  @ApiProperty({ example: 'Rahul Sharma', minLength: 2, maxLength: 60 })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  fullName: string

  @ApiProperty({
    enum: ['dsa_coding', 'cat_prep', 'personal_finance', 'ui_ux_design', 'system_design', 'fitness', 'content_creation', 'product_management', 'data_science', 'other'],
    example: 'dsa_coding',
  })
  @IsEnum([
    'dsa_coding', 'cat_prep', 'personal_finance',
    'ui_ux_design', 'system_design', 'fitness',
    'content_creation', 'product_management',
    'data_science', 'other',
  ])
  primaryNiche: string

  @ApiProperty({ example: 3, minimum: 1, maximum: 20 })
  @IsNumber()
  @Min(1)
  @Max(20)
  experienceYears: number
}

export class CreatorStep2Dto {
  @ApiProperty({ example: 'I help students crack DSA interviews at FAANG.', minLength: 20, maxLength: 150 })
  @IsString()
  @MinLength(20)
  @MaxLength(150)
  bio: string

  @ApiProperty({ type: [String], example: ['LeetCode', 'System Design', 'Java'], minItems: 1, maxItems: 5 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  tags: string[]

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsOptional()
  @IsString()
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
