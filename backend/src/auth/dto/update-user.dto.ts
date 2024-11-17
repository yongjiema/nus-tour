import { IsOptional, IsEmail, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  username?: string;

  @IsEmail()
  @MinLength(3)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
