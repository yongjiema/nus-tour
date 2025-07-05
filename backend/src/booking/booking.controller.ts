import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
  ForbiddenException,
  Patch,
} from "@nestjs/common";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { ReserveSlotDto } from "./dto/reserve-slot.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Booking } from "../database/entities/booking.entity";
import { Public } from "../auth/decorators/public.decorator";
import { BookingStatus } from "src/database/entities/enums";
import { AuthenticatedRequest } from "../common/types/request.types";

@Controller("bookings")
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Booking> {
    this.logger.log(`Creating booking for user: ${req.user.email}`);

    const newBooking = await this.bookingService.createBooking(createBookingDto, req.user);
    this.logger.log(`Booking created with ID: ${newBooking.id}`);
    return newBooking;
  }

  @Get("available-slots")
  async getAvailableTimeSlots(@Query("date") date: string, @Request() req?: AuthenticatedRequest) {
    // Extract user context if authenticated, but don't require auth
    const userContext = req?.user ? { id: req.user.id, email: req.user.email } : undefined;
    return await this.bookingService.getAvailableTimeSlots(date, userContext);
  }

  @Get()
  async getAllBookings() {
    return this.bookingService.findAll();
  }

  @Get("user")
  @UseGuards(JwtAuthGuard)
  async getUserBookings(@Request() req: AuthenticatedRequest) {
    this.logger.log(`Getting bookings for user: ${JSON.stringify(req.user)}`);
    const bookings = await this.bookingService.getAllBookingByUserId(req.user.id);
    this.logger.log(`Found ${bookings.length} bookings for user`);
    return {
      data: bookings,
      total: bookings.length,
    };
  }

  @Get("user/stats")
  @UseGuards(JwtAuthGuard)
  async getUserDashboardStats(@Request() req: AuthenticatedRequest) {
    this.logger.log(`Getting dashboard stats for user: ${req.user.email}`);
    const stats = await this.bookingService.getUserDashboardStats(req.user.id);
    this.logger.log(`User dashboard stats: ${JSON.stringify(stats)}`);
    return {
      data: stats,
    };
  }

  @Get("user/activity")
  @UseGuards(JwtAuthGuard)
  async getUserActivity(@Request() req: AuthenticatedRequest) {
    this.logger.log(`Getting recent activity for user: ${req.user.email}`);
    const activity = await this.bookingService.getUserActivity(req.user.id);
    this.logger.log(`User activity: ${JSON.stringify(activity)}`);
    return {
      data: activity,
    };
  }

  @Public()
  @Get(":bookingId")
  async getBookingById(@Param("bookingId") bookingId: string) {
    return this.bookingService.getBookingById(bookingId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("find-by-booking-id/:bookingId")
  async getBookingByBookingId(@Param("bookingId") bookingId: string, @Request() req: AuthenticatedRequest) {
    this.logger.log(`Finding booking with ID: ${bookingId}`);

    const booking = await this.bookingService.getBookingById(bookingId);

    if (booking.user.id !== req.user.id) {
      throw new ForbiddenException("You do not have access to this booking");
    }

    return booking;
  }

  // Backend controller
  @Post(":bookingId/payment-status")
  @UseGuards(JwtAuthGuard)
  async updatePaymentStatus(
    @Param("bookingId") bookingId: string,
    @Body()
    updateData: {
      status: BookingStatus;
      transactionId: string;
    },
    @Request() req: AuthenticatedRequest,
  ) {
    // 1. Verify booking belongs to user
    const booking = await this.bookingService.getBookingById(bookingId);

    if (booking.user.id !== req.user.id) {
      throw new ForbiddenException("You do not have permission to update this booking");
    }
    // 2. Update both tables in a transaction
    return await this.bookingService.updatePaymentAndBookingStatus(bookingId, updateData.status, {
      transactionId: updateData.transactionId,
      amount: booking.deposit,
      method: "paynow",
      userId: parseInt(req.user.id, 10),
    });
  }

  @Post("reserve")
  @UseGuards(JwtAuthGuard)
  async reserveSlot(@Body() reserveSlotDto: ReserveSlotDto, @Request() req: AuthenticatedRequest): Promise<Booking> {
    this.logger.log(`Reserving slot for user: ${req.user.email}`);

    const reservation = await this.bookingService.reserveSlot(reserveSlotDto, req.user);
    this.logger.log(`Slot reserved with ID: ${reservation.id}`);

    return reservation;
  }

  @Patch(":bookingId/confirm-reservation")
  @UseGuards(JwtAuthGuard)
  async confirmReservation(
    @Param("bookingId") bookingId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Booking> {
    this.logger.log(`Confirming reservation: ${bookingId}`);

    // Verify booking belongs to user
    const booking = await this.bookingService.getBookingById(bookingId);
    if (booking.user.id !== req.user.id) {
      throw new ForbiddenException("You do not have access to this booking");
    }

    const confirmedBooking = await this.bookingService.confirmReservation(bookingId);
    this.logger.log(`Reservation confirmed: ${bookingId}`);
    return confirmedBooking;
  }

  @Patch(":bookingId/cancel-reservation")
  @UseGuards(JwtAuthGuard)
  async cancelReservation(
    @Param("bookingId") bookingId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Booking> {
    this.logger.log(`Canceling reservation: ${bookingId}`);

    // Verify booking belongs to user
    const booking = await this.bookingService.getBookingById(bookingId);
    if (booking.user.id !== req.user.id) {
      throw new ForbiddenException("You do not have access to this booking");
    }

    const cancelledBooking = await this.bookingService.cancelReservation(bookingId);
    this.logger.log(`Reservation cancelled: ${bookingId}`);
    return cancelledBooking;
  }
}
