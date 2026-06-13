import {
  IsDateString, IsNotEmpty, IsOptional, IsString, IsTimeZone,
} from 'class-validator'

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  offeringId!: string

  @IsOptional()
  @IsDateString()
  startTime?: string  // ISO 8601 UTC — required for one_on_one

  @IsOptional()
  @IsDateString()
  endTime?: string    // ISO 8601 UTC — required for one_on_one

  @IsOptional()
  @IsString()
  topic?: string

  @IsOptional()
  @IsTimeZone()
  learnerTimezone?: string
}

export class ConfirmBookingDto {
  @IsString()
  @IsNotEmpty()
  razorpayOrderId!: string

  @IsString()
  @IsNotEmpty()
  razorpayPaymentId!: string

  @IsString()
  @IsNotEmpty()
  razorpaySignature!: string
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  reason?: string
}
