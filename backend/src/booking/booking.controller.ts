// src/booking/booking.controller.ts
import { Controller, Post, Body, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Booking } from '../database/entities/booking.entity';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    return await this.bookingService.createBooking(createBookingDto);
  }

  @Get('available-slots')
  async getAvailableTimeSlots(@Query('date') date: string) {
    return await this.bookingService.getAvailableTimeSlots(date);
  }

  @Get()
  async getAllBookings() {
    return this.bookingService.getAllBookings();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserBookings(@Request() req): Promise<Booking[]> {
    return this.bookingService.getAllBookingByEmail(req.user.email);
  }

  @Get(':id')
  async getBookingById(@Param('id') id: number) {
    return this.bookingService.getBookingById(id);
  }
}
