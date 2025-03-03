import { IsEmail, IsInt, Min, Max } from 'class-validator';

export class CreateBookingDto {
  name: string;
  @IsEmail()
  email: string;
  date: string;
  @IsInt()
  @Min(1)
  @Max(50)
  groupSize: number;
  timeSlot: string;
  deposit?: number;
}
