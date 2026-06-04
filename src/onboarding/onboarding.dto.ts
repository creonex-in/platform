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

// ── Learner ─────────────────────────────────────────────

export class LearnerStep1Dto {

  @IsEnum([
    'cat_prep', 'job_switch', 'skill_upgrade',
    'freelancing', 'investing', 'fitness', 'other',
  ])
  goalType: string
}

export class LearnerStep2Dto {
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

  @IsOptional()
  @IsEnum([
    'under_500', '500_1000', '1000_2000',
    'above_2000', 'flexible',
  ])
  budgetRange?: string
}

// ── Creator ──────────────────────────────────────────────

export class CreatorStep1Dto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  fullName: string

  @IsEnum([
    'dsa_coding', 'cat_prep', 'personal_finance',
    'ui_ux_design', 'system_design', 'fitness',
    'content_creation', 'product_management',
    'data_science', 'other',
  ])
  primaryNiche: string

  @IsNumber()
  @Min(1)
  @Max(20)
  experienceYears: number
}

export class CreatorStep2Dto {
  @IsString()
  @MinLength(20)
  @MaxLength(150)
  bio: string

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  tags: string[]

  @IsOptional()
  @IsString()
  photoUrl?: string
}

export class CreatorStep3Dto {
  @IsEnum(['one_on_one', 'workshop', 'group', 'digital'])
  offerType: string

  @IsString()
  @MinLength(5)
  @MaxLength(60)
  title: string

  @IsNumber()
  @Min(99)
  price: number

  @IsOptional()
  @IsNumber()
  @IsIn([30, 45, 60, 90])
  durationMinutes?: number
}
