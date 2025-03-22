import { IsNotEmpty, IsEnum, IsString, IsOptional } from "class-validator";
import { PaymentStatus } from "../../database/entities/enums";

export class UpdatePaymentStatusDto {
  @IsNotEmpty()
  bookingId: string | number;

  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
