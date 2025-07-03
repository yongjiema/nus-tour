import { IsOptional, IsString, IsEnum, IsDateString } from "class-validator";
import { BookingStatus } from "../../../database/entities/enums";

export class BookingFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsDateString()
  date?: string;
}
