import { IsOptional, IsEmail, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @MinLength(3)
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  @MinLength(3)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
