import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsEmail()
  @MinLength(3)
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
