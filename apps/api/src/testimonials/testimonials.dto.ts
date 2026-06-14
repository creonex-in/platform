import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator'

export class SubmitTestimonialDto {
  @IsString()
  @IsNotEmpty()
  learnerName!: string

  @IsOptional()
  @IsString()
  learnerRole?: string

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  content!: string

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number
}

export class UpdateVisibilityDto {
  @IsBoolean()
  isPublic!: boolean
}
