import { IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";

export class CreatePaymentDto {
  @IsNotEmpty()
  bookingId!: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
