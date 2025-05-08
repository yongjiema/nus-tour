import { IsNotEmpty, IsEnum, IsString, IsOptional } from "class-validator";
import { BookingLifecycleStatus } from "../../database/entities/enums";

export class UpdatePaymentStatusDto {
  @IsNotEmpty()
  bookingId: string | number;

  @IsNotEmpty()
  @IsEnum(BookingLifecycleStatus)
  status: BookingLifecycleStatus;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
