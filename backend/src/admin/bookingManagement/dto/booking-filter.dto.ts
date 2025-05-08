import { IsOptional, IsString, IsEnum, IsDateString } from "class-validator";
import { BookingLifecycleStatus } from "../../../database/entities/enums";

export class BookingFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(BookingLifecycleStatus)
  status?: BookingLifecycleStatus;

  @IsOptional()
  @IsDateString()
  date?: string;
}
