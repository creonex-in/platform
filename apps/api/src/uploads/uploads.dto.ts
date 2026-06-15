import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import type { UploadScope } from '@creonex/types'

/** Upload destinations. `digital_asset` is private (gated); the rest are public CDN. */
export const UPLOAD_SCOPES = ['profile', 'banner', 'digital_asset'] as const

/** 5 GB ceiling — real caps are enforced per-scope/plan in the (future) S3 layer. */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 * 1024

export class PresignUploadDto {
  @ApiProperty({ enum: UPLOAD_SCOPES })
  @IsEnum(UPLOAD_SCOPES)
  scope!: UploadScope

  @ApiProperty()
  @IsString()
  fileName!: string

  @ApiProperty()
  @IsString()
  contentType!: string

  @ApiProperty({ maximum: MAX_UPLOAD_BYTES })
  @IsInt()
  @Min(1)
  @Max(MAX_UPLOAD_BYTES)
  sizeBytes!: number

  @ApiPropertyOptional({ description: 'Required for digital_asset — the owning offering.' })
  @IsOptional()
  @IsString()
  offeringId?: string
}

export class ConfirmUploadDto {
  @ApiProperty()
  @IsString()
  key!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  offeringId?: string
}

export class DeleteUploadDto {
  @ApiProperty()
  @IsString()
  key!: string
}
