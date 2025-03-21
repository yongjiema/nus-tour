import { IsOptional, IsString, IsEnum, IsDateString } from "class-validator";
import { BookingStatus, PaymentStatus } from "../../../database/entities/enums";

export class BookingFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  bookingStatus?: BookingStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  date?: string;
}
