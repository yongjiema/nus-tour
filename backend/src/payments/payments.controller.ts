import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Payment } from '../database/entities/payments.entity';

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

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserPayments(@Request() req): Promise<Payment[]> {
    return this.paymentsService.getPaymentsByUserId(req.user.id);
  }
}
