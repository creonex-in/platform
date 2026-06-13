import { IsNotEmpty, IsString } from 'class-validator'

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  bookingId!: string
}

export class VerifyPaymentDto {
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
