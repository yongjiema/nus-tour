import { Controller, Post, Body, Patch, Param, Get, UseGuards, Logger, Query, Request } from '@nestjs/common';
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
  @UseGuards(JwtAuthGuard) // Require authentication
  async createPayment(@Body() createPaymentDto: CreatePaymentDto, @Request() req): Promise<Payment> {
    this.logger.log(`Payment creation request from user ${req.user.email} for booking: ${createPaymentDto.bookingId}`);
    return this.paymentsService.createPayment(createPaymentDto, req.user);
  }

  @Patch('status')
  async updatePaymentStatus(@Body() updateDto: UpdatePaymentStatusDto): Promise<Payment> {
    this.logger.log(`Payment status update request received for booking: ${updateDto.bookingId}`);
    return this.paymentsService.updatePaymentStatus(updateDto);
  }

  @Get('booking/:bookingId')
  @Public()
  async getPaymentByBookingId(@Param('bookingId') bookingId: string): Promise<Payment> {
    // Convert to number only after we've handled string possibility
    return this.paymentsService.getPaymentByBookingId(Number(bookingId));
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
