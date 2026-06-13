import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean, IsEnum, IsOptional, IsString, Matches,
} from 'class-validator'
import { OVERRIDE_TYPES, type OverrideType } from '@creonex/types'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

// ── Schedules ─────────────────────────────────────────────────────────────────

export class CreateScheduleDto {
  @ApiProperty({ example: 'Default Availability' })
  @IsString()
  name!: string

  @ApiProperty({ example: 'Asia/Kolkata', description: 'IANA timezone' })
  @IsString()
  timezone!: string

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}

export class UpdateScheduleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}

// ── Rules ─────────────────────────────────────────────────────────────────────

export class AddRuleDto {
  @ApiProperty({
    example: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
    description: 'RFC 5545 RRULE string without RRULE: prefix',
  })
  @IsString()
  rrule!: string

  @ApiProperty({ example: '09:00', description: 'HH:MM in schedule timezone' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be HH:MM' })
  startTime!: string

  @ApiProperty({ example: '18:00', description: 'HH:MM in schedule timezone' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be HH:MM' })
  endTime!: string
}

export class UpdateRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rrule?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be HH:MM' })
  startTime?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be HH:MM' })
  endTime?: string
}

// ── Overrides ─────────────────────────────────────────────────────────────────

export class AddOverrideDto {
  @ApiProperty({ example: '2024-12-25', description: 'YYYY-MM-DD in schedule timezone' })
  @IsString()
  @Matches(DATE_REGEX, { message: 'date must be YYYY-MM-DD' })
  date!: string

  @ApiProperty({ enum: OVERRIDE_TYPES })
  @IsEnum(OVERRIDE_TYPES)
  type!: OverrideType

  @ApiPropertyOptional({ example: '10:00', description: 'Required when type=custom' })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be HH:MM' })
  startTime?: string

  @ApiPropertyOptional({ example: '14:00', description: 'Required when type=custom' })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be HH:MM' })
  endTime?: string
}

// ── Slots query ───────────────────────────────────────────────────────────────

export class GetSlotsQueryDto {
  @ApiProperty({ example: 'Asia/Kolkata', description: 'Learner IANA timezone for response' })
  @IsString()
  timezone!: string

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Start date YYYY-MM-DD; defaults to today' })
  @IsOptional()
  @IsString()
  @Matches(DATE_REGEX, { message: 'from must be YYYY-MM-DD' })
  from?: string

  @ApiPropertyOptional({ example: '2024-01-22', description: 'End date YYYY-MM-DD; defaults to offering bookingWindowDays' })
  @IsOptional()
  @IsString()
  @Matches(DATE_REGEX, { message: 'to must be YYYY-MM-DD' })
  to?: string
}
