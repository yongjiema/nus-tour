import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { BookingFilterDto } from "./dto/booking-filter.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { BookingLifecycleStatus } from "../../database/entities/enums";

@Controller("admin/bookings")
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  async getBookings(@Query() query: any) {
    const filterDto = new BookingFilterDto();

    // Parse the JSON filter query if it exists
    if (query.s) {
      try {
        const parsed = JSON.parse(query.s);

        // Extract status filter criteria
        if (parsed.$and && Array.isArray(parsed.$and)) {
          parsed.$and.forEach((condition: any) => {
            if (condition.status && condition.status.$eq) {
              filterDto.status = condition.status.$eq;
            }
          });
        }
      } catch (e) {
        console.error("Error parsing filter query:", e);
      }
    }

    return this.bookingService.getFilteredBookings(filterDto);
  }

  @Post(":id/status")
  async updateStatus(@Param("id") id: string, @Body() statusUpdate: { status: string }) {
    // Make sure we're using the correct lifecycle status
    return this.bookingService.updateStatus(id, statusUpdate.status as BookingLifecycleStatus);
  }
}
