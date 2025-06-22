import { IsEmail, IsInt, Min, Max, IsString, IsDateString } from "class-validator";

export class CreateBookingDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsDateString()
  date!: string;

  @IsInt()
  @Min(1, { message: "Group size must be at least 1 person" })
  @Max(50, { message: "Group size cannot exceed 50 people" })
  groupSize!: number;

  @IsString()
  timeSlot!: string;

  deposit?: number;
}
