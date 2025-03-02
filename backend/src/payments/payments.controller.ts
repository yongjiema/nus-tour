import { Controller, Post, Body, Patch, Param, Get, UseGuards, Logger, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Payment } from '../database/entities/payments.entity';
import { PaymentStatus } from '../database/entities/enums';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Get()
  async findAll(@Query('limit') limit = 10, @Query('page') page = 1) {
    this.logger.log(`Getting payments list with limit: ${limit}, page: ${page}`);

    // Get payments by user ID if provided, otherwise return empty result
    // This matches the format Refine expects
    return {
      data: [],
      total: 0,
      page: +page,
      pageCount: 0,
    };
  }

  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    this.logger.log(`Payment creation request received for booking: ${createPaymentDto.bookingId}`);
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Patch('status')
  async updatePaymentStatus(@Body() updateDto: UpdatePaymentStatusDto): Promise<Payment> {
    this.logger.log(`Payment status update request received for booking: ${updateDto.bookingId}`);
    return this.paymentsService.updatePaymentStatus(updateDto);
  }

  @Get('booking/:bookingId')
  async getPaymentByBookingId(@Param('bookingId') bookingId: number): Promise<Payment> {
    return this.paymentsService.getPaymentByBookingId(bookingId);
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard)
  @Post('admin/complete/:bookingId')
  async completePayment(@Param('bookingId') bookingId: number): Promise<Payment> {
    this.logger.log(`Admin payment completion request for booking: ${bookingId}`);
    return this.paymentsService.updatePaymentStatus({
      bookingId: +bookingId,
      status: PaymentStatus.COMPLETED,
    });
  }
}
