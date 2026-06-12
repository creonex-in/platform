import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsUrl,
  IsIn,
  MinLength,
  MaxLength,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  NICHES,
  GOAL_TYPES,
  OFFER_TYPES,
  DURATION_OPTIONS,
  NICHE_CATEGORIES,
  CREDENTIAL_TYPES,
  AUDIENCE_TYPES,
  PLATFORM_TYPES,
  CREATOR_GOALS,
  type GoalType,
  type Niche,
  type OfferType,
  type DurationOption,
  type NicheCategory,
  type CredentialType,
  type AudienceType,
  type PlatformType,
  type CreatorGoal,
} from '@creonex/types'

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

  @ApiPropertyOptional({ type: [String], enum: NICHES })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsEnum(NICHES, { each: true })
  interestedNiches?: Niche[]
}

/** Step 1 = creator discovery questions (name + 5 discovery answers) */
export class CreatorStep1Dto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  fullName!: string

  @ApiProperty({ enum: NICHE_CATEGORIES })
  @IsEnum(NICHE_CATEGORIES)
  nicheCategory!: NicheCategory

  @ApiProperty({ enum: CREDENTIAL_TYPES })
  @IsEnum(CREDENTIAL_TYPES)
  credentialType!: CredentialType

  @ApiProperty({ enum: AUDIENCE_TYPES })
  @IsEnum(AUDIENCE_TYPES)
  audienceType!: AudienceType

  @ApiProperty({ enum: PLATFORM_TYPES })
  @IsEnum(PLATFORM_TYPES)
  primaryPlatform!: PlatformType

  @ApiProperty({ enum: CREATOR_GOALS })
  @IsEnum(CREATOR_GOALS)
  creatorGoal!: CreatorGoal
}

export class SocialLinksDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  youtube?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  linkedin?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  instagram?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  twitter?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string
}

export class CreatorStep2Dto {
  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
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

  @ApiPropertyOptional({ type: SocialLinksDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto
}

export class CreatorStep3Dto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bannerUrl?: string

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  languages!: string[]
}

export class CreatorStep4Dto {
  @ApiProperty({ enum: OFFER_TYPES })
  @IsEnum(OFFER_TYPES)
  offerType!: OfferType

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(80)
  title!: string

  @ApiProperty({ minimum: 299, description: 'Price in INR' })
  @IsNumber()
  @Min(299)
  price!: number

  @ApiPropertyOptional({ enum: DURATION_OPTIONS })
  @IsOptional()
  @IsIn([...DURATION_OPTIONS])
  durationMinutes?: DurationOption

  @ApiPropertyOptional({ minimum: 2, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(100)
  seatsTotal?: number
}
