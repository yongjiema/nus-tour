import { IsNotEmpty, IsEmail } from "class-validator";

export class CheckinDto {
  @IsNotEmpty()
  bookingId!: string;

  @IsEmail()
  email!: string;
}
