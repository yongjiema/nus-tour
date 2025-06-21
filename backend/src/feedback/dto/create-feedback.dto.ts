import { IsNotEmpty, IsNumber, IsString, Min, Max, IsOptional, IsBoolean } from "class-validator";

export class CreateFeedbackDto {
  @IsNotEmpty()
  bookingId!: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsNotEmpty()
  comments!: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
