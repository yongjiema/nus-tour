// src/booking/booking.controller.ts
import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

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

  @Get(':id')
  async getBookingById(@Param('id') id: number) {
    return this.bookingService.getBookingById(id);
  }
}
