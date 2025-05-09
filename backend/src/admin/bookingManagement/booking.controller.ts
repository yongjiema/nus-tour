import { Controller, Get, Post, Body, Param, Query, UseGuards, BadRequestException } from "@nestjs/common";
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
    console.log("Raw query params:", query);

    try {
      // Handle filters from Refine data provider
      if (query.filters) {
        const filters = JSON.parse(query.filters);
        console.log("Parsed filters:", filters);

        // Process each filter
        filters.forEach((filter) => {
          if (filter.field === "search" && filter.value) {
            filterDto.search = filter.value;
            console.log(`Setting search filter to: ${filterDto.search}`);
          }

          if (filter.field === "status" && filter.value) {
            filterDto.status = filter.value;
          }

          if (filter.field === "date" && filter.value) {
            filterDto.date = filter.value;
          }
        });
      }

      // Legacy support for NestJS CRUD filters
      if (query.s) {
        try {
          const parsed = JSON.parse(query.s);
          console.log("Parsed 's' parameter:", parsed);

          // Process $and conditions
          if (parsed.$and && Array.isArray(parsed.$and)) {
            parsed.$and.forEach((condition) => {
              // Handle 'status' condition
              if (condition.status && condition.status.$eq) {
                filterDto.status = condition.status.$eq;
                console.log(`Found status filter: ${filterDto.status}`);
              }

              // Handle bookingStatus condition (alternative field name)
              if (condition.bookingStatus && condition.bookingStatus.$eq) {
                filterDto.status = condition.bookingStatus.$eq;
                console.log(`Found bookingStatus filter: ${filterDto.status}`);
              }

              // Handle date condition
              if (condition.date && condition.date.$eq) {
                filterDto.date = condition.date.$eq;
                console.log(`Found date filter: ${filterDto.date}`);
              }

              // Handle search condition
              if (condition.search && condition.search.$contL) {
                filterDto.search = condition.search.$contL;
                console.log(`Found search filter: ${filterDto.search}`);
              }
            });
          }

          // Handle single conditions without $and
          if (parsed.status && parsed.status.$eq) {
            filterDto.status = parsed.status.$eq;
          }
          if (parsed.bookingStatus && parsed.bookingStatus.$eq) {
            filterDto.status = parsed.bookingStatus.$eq;
          }
          if (parsed.date && parsed.date.$eq) {
            filterDto.date = parsed.date.$eq;
          }
          if (parsed.search && parsed.search.$contL) {
            filterDto.search = parsed.search.$contL;
          }
        } catch (e) {
          console.error("Error parsing 's' parameter:", e);
        }
      }

      console.log("Final filter DTO:", filterDto);

      // Now apply these filters in your service
      const bookings = await this.bookingService.getFilteredBookings(filterDto);
      return bookings;
    } catch (e) {
      console.error("Error processing filters:", e);
      throw new BadRequestException("Invalid filter parameters");
    }
  }

  @Post(":id/status")
  async updateStatus(@Param("id") id: string, @Body() statusUpdate: { status: string }) {
    // Make sure we're using the correct lifecycle status
    return this.bookingService.updateStatus(id, statusUpdate.status as BookingLifecycleStatus);
  }
}
