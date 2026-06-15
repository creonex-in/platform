import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ArrayMaxSize,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  NICHES,
  USERNAME_MIN,
  USERNAME_MAX,
  USERNAME_REGEX,
  type Niche,
} from '@creonex/types'
import { SocialLinksDto } from '../../onboarding/onboarding.dto'

/**
 * Partial update for a creator's own profile (post-onboarding edit). Every field
 * is optional; only provided fields are written. Does NOT touch onboarding state.
 */
export class UpdateCreatorProfileDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 60 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  displayName?: string

  @ApiPropertyOptional({ minLength: USERNAME_MIN, maxLength: USERNAME_MAX })
  @IsOptional()
  @IsString()
  @MinLength(USERNAME_MIN)
  @MaxLength(USERNAME_MAX)
  @Matches(USERNAME_REGEX, {
    message: 'Username may only use lowercase letters, numbers, and single hyphens',
  })
  username?: string

  @ApiPropertyOptional({ minLength: 20, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  bio?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  profilePhotoUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverBannerUrl?: string

  @ApiPropertyOptional({ enum: NICHES })
  @IsOptional()
  @IsEnum(NICHES)
  primaryNiche?: Niche

  @ApiPropertyOptional({ minimum: 0, maximum: 60 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  experienceYears?: number

  @ApiPropertyOptional({ type: SocialLinksDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  languages?: string[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(30, { each: true })
  tags?: string[]
}
