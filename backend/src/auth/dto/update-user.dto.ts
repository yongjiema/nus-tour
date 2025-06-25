import { IsOptional, IsEmail, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  @MinLength(3)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
