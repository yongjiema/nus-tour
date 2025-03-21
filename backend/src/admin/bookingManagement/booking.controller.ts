import { Controller, Get, UseGuards, Request, Patch, Query, Param, Body } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { BookingStatus } from "../../database/entities/enums";

@Controller("admin/bookings")
@UseGuards(JwtAuthGuard) // Protect with authentication
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // Retrieve all bookings with optional filters
  @UseGuards(JwtAuthGuard)
  @Get("findAll")
  findAll(@Request() req) {
    console.log("User making request:", req.user); // Debugging
    return this.bookingService.findAll();
  }
  @Get()
  async getBookings(@Query("search") search: string, @Query("status") status: string, @Query("date") date: string) {
    return this.bookingService.getFilteredBookings(search, status, date);
  }
  // Update booking status (e.g., Confirm, Cancel, Check-in)
  @Patch(":id")
  async updateBookingStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.bookingService.updateBookingStatus(id, status as BookingStatus);
  }
}
