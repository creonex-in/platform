import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize, IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUrl,
  Max, MaxLength, Min, MinLength, ValidateNested,
} from 'class-validator'
import {
  OFFER_TYPES, OFFER_STATUSES, LIVE_EVENT_FORMATS,
  type OfferType, type OfferStatus, type LiveEventFormat,
} from '@creonex/types'

/** One uploaded digital file, referenced by its S3 key (set via the uploads flow). */
export class DigitalFileDto {
  @ApiProperty()
  @IsString()
  key!: string

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name!: string

  @ApiProperty()
  @IsInt()
  @Min(0)
  sizeBytes!: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentType?: string
}

export class CreateOfferingDto {
  @ApiProperty({ enum: OFFER_TYPES })
  @IsEnum(OFFER_TYPES)
  type!: OfferType

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(80)
  title!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiProperty({ minimum: 99, description: 'Price in INR' })
  @IsNumber()
  @Min(99)
  price!: number

  @ApiPropertyOptional({ minimum: 15, maximum: 480 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes?: number

  @ApiPropertyOptional({ minimum: 2, maximum: 500 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(500)
  seatsTotal?: number

  @ApiPropertyOptional({ default: 120, description: 'Min notice before booking, minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10080)
  minNoticeMinutes?: number

  @ApiPropertyOptional({ default: 30, description: 'How far ahead learner can book, days' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  bookingWindowDays?: number

  @ApiPropertyOptional({ default: 0, description: 'Buffer after session ends, minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  bufferAfterMinutes?: number

  // ── live_event ──────────────────────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Fixed event datetime (UTC ISO) — live_event only' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string

  @ApiPropertyOptional({ enum: LIVE_EVENT_FORMATS, description: 'group | webinar — live_event only' })
  @IsOptional()
  @IsEnum(LIVE_EVENT_FORMATS)
  format?: LiveEventFormat

  // ── digital ───────────────────────────────────────────────────────────────--
  @ApiPropertyOptional({ type: [DigitalFileDto], description: 'Uploaded files — digital only' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => DigitalFileDto)
  deliveryFiles?: DigitalFileDto[]

  @ApiPropertyOptional({ description: 'External delivery link — digital only' })
  @IsOptional()
  @IsUrl()
  externalUrl?: string

  @ApiPropertyOptional({ description: 'Post-purchase instructions — digital only' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  deliveryInstructions?: string
}

export class UpdateOfferingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(80)
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ minimum: 99 })
  @IsOptional()
  @IsNumber()
  @Min(99)
  price?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(500)
  seatsTotal?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10080)
  minNoticeMinutes?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  bookingWindowDays?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  bufferAfterMinutes?: number

  @ApiPropertyOptional({ description: 'Fixed event datetime (UTC ISO) — live_event only' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string

  @ApiPropertyOptional({ enum: LIVE_EVENT_FORMATS })
  @IsOptional()
  @IsEnum(LIVE_EVENT_FORMATS)
  format?: LiveEventFormat

  @ApiPropertyOptional({ type: [DigitalFileDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => DigitalFileDto)
  deliveryFiles?: DigitalFileDto[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  externalUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  deliveryInstructions?: string
}

export class UpdateOfferingStatusDto {
  @ApiProperty({ enum: OFFER_STATUSES })
  @IsEnum(OFFER_STATUSES)
  status!: OfferStatus
}
