import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @MinLength(3)
  @IsString()
  username: string;

  @IsEmail()
  @MinLength(3)
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
