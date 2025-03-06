import { IsNotEmpty, IsNumber, IsEnum, IsString, IsOptional } from 'class-validator';
import { PaymentStatus } from '../../database/entities/enums';

export class CreatePaymentDto {
  @IsNotEmpty()
  bookingId: string | number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
