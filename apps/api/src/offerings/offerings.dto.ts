import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum, IsInt, IsNumber, IsOptional, IsString,
  Max, MaxLength, Min, MinLength,
} from 'class-validator'
import { OFFER_TYPES, OFFER_STATUSES, type OfferType, type OfferStatus } from '@creonex/types'

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
}

export class UpdateOfferingStatusDto {
  @ApiProperty({ enum: OFFER_STATUSES })
  @IsEnum(OFFER_STATUSES)
  status!: OfferStatus
}
