import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength,
} from 'class-validator'
import { SAVED_TARGET_TYPES } from '@creonex/types'

export class CreateSavedDto {
  @ApiProperty({ enum: SAVED_TARGET_TYPES })
  @IsIn(SAVED_TARGET_TYPES)
  targetType!: 'creator' | 'offering'

  @ApiProperty()
  @IsString()
  targetId!: string
}

export class CreateNoteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  content?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bookingId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  offeringId?: string
}

export class UpdateNoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  content?: string
}

export class UpdateLearnerProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  goalType?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interestedNiches?: string[]
}
