import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import {
  EXPLORE_SORTS, NICHES, OFFER_TYPES,
  type ExploreSort, type Niche, type OfferType,
} from '@creonex/types'

/** Query for GET /v1/explore — all fields optional; the service applies defaults. */
export class BrowseOfferingsQueryDto {
  @ApiPropertyOptional({ enum: ['all', ...OFFER_TYPES], default: 'all' })
  @IsOptional()
  @IsIn(['all', ...OFFER_TYPES])
  type?: 'all' | OfferType

  @ApiPropertyOptional({ enum: ['all', ...NICHES], default: 'all' })
  @IsOptional()
  @IsIn(['all', ...NICHES])
  niche?: 'all' | Niche

  @ApiPropertyOptional({ description: 'Free-text query (ignored under 2 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string

  @ApiPropertyOptional({ enum: EXPLORE_SORTS, default: 'relevance' })
  @IsOptional()
  @IsIn(EXPLORE_SORTS)
  sort?: ExploreSort

  @ApiPropertyOptional({ minimum: 1, maximum: 48, default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  limit?: number

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number
}
