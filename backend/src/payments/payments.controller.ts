import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async createPayment(@Body() createPaymentDto: { bookingId: string; amount: number }) {
    const { bookingId, amount } = createPaymentDto;
    return this.paymentsService.createPayment(bookingId, amount);
  }

  @Post('confirm')
  async confirmPayment(@Body() confirmPaymentDto: { bookingId: string }) {
    const { bookingId } = confirmPaymentDto;
    return this.paymentsService.confirmPayment(bookingId);
  }
}
