import { IsEmail, IsInt, Min, Max, IsString, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  @Max(50)
  groupSize: number;

  @IsString()
  timeSlot: string;

  deposit?: number;
}
