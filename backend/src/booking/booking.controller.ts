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
} from "@nestjs/common";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Booking } from "../database/entities/booking.entity";
import { Public } from "../auth/decorators/public.decorator";

@Controller("bookings")
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBooking(@Body() createBookingDto: CreateBookingDto, @Request() req): Promise<Booking> {
    try {
      this.logger.log(`Creating booking for user: ${req.user.email}`);

      // Add user information from token
      const bookingData = {
        ...createBookingDto,
        email: req.user.email,
        name: req.user.username,
      };

      const newBooking = await this.bookingService.createBooking(bookingData);
      this.logger.log(`Booking created with ID: ${newBooking.bookingId}`);
      return newBooking;
    } catch (error) {
      this.logger.error(`Failed to create booking: ${error.message}`);
      throw error;
    }
  }

  @Get("available-slots")
  async getAvailableTimeSlots(@Query("date") date: string) {
    return await this.bookingService.getAvailableTimeSlots(date);
  }

  @Get()
  async getAllBookings() {
    return this.bookingService.getAllBookings();
  }

  @Get("user")
  @UseGuards(JwtAuthGuard)
  async getUserBookings(@Request() req) {
    this.logger.log(`Getting bookings for user: ${JSON.stringify(req.user)}`);
    const bookings = await this.bookingService.getAllBookingByEmail(req.user.email);
    this.logger.log(`Found ${bookings.length} bookings for user`);
    return {
      data: bookings,
      total: bookings.length,
    };
  }

  @Public()
  @Get(":id")
  async getBookingById(@Param("id") id: number) {
    return this.bookingService.getBookingById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("find-by-booking-id/:bookingId")
  async getBookingByBookingId(@Param("bookingId") bookingId: string, @Request() req) {
    this.logger.log(`Finding booking with ID: ${bookingId}`);

    try {
      const booking = await this.bookingService.getBookingByBookingId(bookingId);

      // Optional: Verify the booking belongs to the authenticated user
      if (booking.email !== req.user.email) {
        throw new ForbiddenException("You do not have access to this booking");
      }

      return booking;
    } catch (error) {
      this.logger.error(`Failed to find booking by ID ${bookingId}: ${error.message}`);
      throw error;
    }
  }
}
