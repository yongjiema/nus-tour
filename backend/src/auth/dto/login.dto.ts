import { IsString, IsEmail, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  @MinLength(3)
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
