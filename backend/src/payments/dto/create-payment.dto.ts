import { IsNotEmpty, IsNumber, IsEnum, IsString, IsOptional } from "class-validator";
import { BookingLifecycleStatus } from "../../database/entities/enums";

export class CreatePaymentDto {
  @IsNotEmpty()
  bookingId: string | number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(BookingLifecycleStatus)
  status?: BookingLifecycleStatus;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
