import { Controller, Get, UseGuards, Post, Query, Param, Body } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { BookingStatus, PaymentStatus } from "../../database/entities/enums";
import { BookingFilterDto } from "./dto/booking-filter.dto";

@Controller("admin/bookings")
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  async getBookings(@Query() query: any) {
    console.log("Received query:", query);
    const filterDto = new BookingFilterDto();

    // Look for the "s" parameter
    if (query.s) {
      try {
        const parsed = JSON.parse(query.s);
        // Expected structure: { "$and": [ { "bookingStatus": { "$eq": "pending" } }, { "search": { "$contL":"wgz" } }, ... ] }
        if (parsed.$and && Array.isArray(parsed.$and)) {
          parsed.$and.forEach((condition: any) => {
            if (condition.bookingStatus && condition.bookingStatus.$eq) {
              filterDto.bookingStatus = condition.bookingStatus.$eq;
            }
            if (condition.paymentStatus && condition.paymentStatus.$eq) {
              filterDto.paymentStatus = condition.paymentStatus.$eq;
            }
            if (condition.date && condition.date.$eq) {
              filterDto.date = condition.date.$eq;
            }
            // Check for search using contains
            if (condition.search && condition.search.$contL) {
              filterDto.search = condition.search.$contL;
            }
            // You can also check for $or conditions if needed.
            if (condition.$or && Array.isArray(condition.$or)) {
              if (condition.$or[0]?.bookingId?.$regex) {
                filterDto.search = condition.$or[0].bookingId.$regex;
              }
            }
          });
        }
      } catch (error) {
        console.error("Error parsing s:", error);
      }
    }

    console.log("Parsed filterDto:", filterDto);
    return this.bookingService.getFilteredBookings(filterDto);
  }

  @Post(":id/payment")
  async updatePaymentStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.bookingService.updatePaymentStatus(id, status as PaymentStatus);
  }

  @Post(":id")
  async updateBookingStatus(@Param("id") id: string, @Body("bookingStatus") bookingStatus: string) {
    return this.bookingService.updateBookingStatus(id, bookingStatus as BookingStatus);
  }
}
