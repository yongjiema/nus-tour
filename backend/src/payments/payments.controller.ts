import { Controller, Post, Body, Get, Param, UseGuards, Request, Logger, Query } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Payment } from "../database/entities/payments.entity";
import { AuthenticatedRequest } from "../common/types/request.types";

@Controller("payments")
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(@Query("limit") limit = 10, @Query("page") page = 1) {
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
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Payment> {
    this.logger.log(`Payment creation request from user ${req.user.email} for booking: ${createPaymentDto.bookingId}`);
    return this.paymentsService.createPayment(createPaymentDto, req.user);
  }

  @Post("status")
  async updatePaymentStatus(@Body() updateDto: UpdatePaymentStatusDto): Promise<Payment> {
    this.logger.log(`Payment update request received for booking: ${updateDto.bookingId}`);
    return this.paymentsService.updatePaymentStatus(updateDto);
  }

  @Get("booking/:bookingId")
  async getPaymentByBookingId(@Param("bookingId") bookingId: string): Promise<Payment> {
    this.logger.log(`Payment lookup request for booking: ${bookingId}`);
    // Pass the booking ID directly as a string – the service layer will resolve it
    return this.paymentsService.getPaymentByBookingId(bookingId);
  }

  @Post("complete/:bookingId")
  @UseGuards(JwtAuthGuard)
  async completePayment(@Param("bookingId") bookingId: string): Promise<Payment> {
    this.logger.log(`Payment completion request for booking: ${bookingId}`);
    return this.paymentsService.updatePaymentStatus({
      bookingId: bookingId,
      transactionId: `TXN-${Date.now()}`,
    });
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard)
  @Post("admin/complete/:bookingId")
  async completePaymentAdmin(@Param("bookingId") bookingId: string): Promise<Payment> {
    this.logger.log(`Admin payment completion request for booking: ${bookingId}`);
    return this.paymentsService.updatePaymentStatus({
      bookingId,
    });
  }

  @Get("user")
  @UseGuards(JwtAuthGuard)
  async getUserPayments(@Request() req: AuthenticatedRequest) {
    this.logger.log(`Getting payments for user: ${JSON.stringify(req.user)}`);
    const userId = req.user.id;
    const payments = await this.paymentsService.getPaymentsByUserId(userId);
    this.logger.log(`Found ${payments.length} payments for user`);
    return {
      data: payments,
      total: payments.length,
    };
  }
}
