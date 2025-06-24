import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class UpdatePaymentStatusDto {
  @IsNotEmpty()
  bookingId!: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
