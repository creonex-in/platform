import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { PAYOUT_ENTITY_TYPES, type PayoutEntityType } from '@creonex/types'

export class SubmitKycDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  legalName!: string

  @ApiProperty({ enum: PAYOUT_ENTITY_TYPES })
  @IsEnum(PAYOUT_ENTITY_TYPES)
  entityType!: PayoutEntityType

  @ApiProperty({ example: '9876543210' })
  @Matches(/^(\+91)?[6-9]\d{9}$/, { message: 'Invalid phone number' })
  phone!: string

  @ApiProperty({ example: 'ABCDE1234F' })
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, { message: 'Invalid PAN format' })
  pan!: string

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  bankAccountNumber!: string

  @ApiProperty({ example: 'HDFC0001234' })
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid IFSC format' })
  bankIfsc!: string

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  accountHolderName!: string
}
