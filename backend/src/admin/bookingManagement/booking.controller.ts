import { Controller, Get, Post, Body, Param, Query, UseGuards, BadRequestException, Logger } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { BookingFilterDto } from "./dto/booking-filter.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { BookingStatus } from "../../database/entities/enums";

// Define interfaces for type safety
interface FilterCondition {
  field: string;
  value: string | number | boolean;
}

interface QueryCondition {
  $eq?: string | number;
  $contL?: string;
}

interface ParsedCondition {
  status?: QueryCondition;
  bookingStatus?: QueryCondition;
  date?: QueryCondition;
  search?: QueryCondition;
}

interface ParsedQuery {
  $and?: ParsedCondition[];
  status?: QueryCondition;
  bookingStatus?: QueryCondition;
  date?: QueryCondition;
  search?: QueryCondition;
}

interface BookingQuery {
  filters?: string;
  s?: string;
  [key: string]: unknown;
}

@Controller("admin/bookings")
@UseGuards(JwtAuthGuard)
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Get()
  async getBookings(@Query() query: BookingQuery) {
    const filterDto = new BookingFilterDto();
    this.logger.debug(`Raw query params: ${JSON.stringify(query)}`);

    // Handle filters from Refine data provider
    if (query.filters) {
      const filters = JSON.parse(query.filters) as FilterCondition[];
      this.logger.debug(`Parsed filters: ${JSON.stringify(filters)}`);

      // Process each filter
      filters.forEach((filter: FilterCondition) => {
        if (filter.field === "search" && filter.value) {
          filterDto.search = String(filter.value);
          this.logger.debug(`Setting search filter to: ${filterDto.search}`);
        }

        if (filter.field === "status" && filter.value) {
          filterDto.status = String(filter.value) as BookingStatus;
        }

        if (filter.field === "date" && filter.value) {
          filterDto.date = String(filter.value);
        }
      });
    }

    // Support for old NestJS CRUD-style filters
    if (query.s) {
      try {
        const parsed = JSON.parse(query.s) as ParsedQuery;
        this.logger.debug(`Parsed 's' parameter: ${JSON.stringify(parsed)}`);

        if (parsed.$and && Array.isArray(parsed.$and)) {
          parsed.$and.forEach((condition: ParsedCondition) => {
            if (condition.status?.$eq) {
              filterDto.status = String(condition.status.$eq) as BookingStatus;
            }
            if (condition.bookingStatus?.$eq) {
              filterDto.status = String(condition.bookingStatus.$eq) as BookingStatus;
            }
            if (condition.date?.$eq) {
              filterDto.date = String(condition.date.$eq);
            }
            if (condition.search?.$contL) {
              filterDto.search = String(condition.search.$contL);
            }
          });
        }

        if (parsed.status?.$eq) {
          filterDto.status = String(parsed.status.$eq) as BookingStatus;
        }
        if (parsed.bookingStatus?.$eq) {
          filterDto.status = String(parsed.bookingStatus.$eq) as BookingStatus;
        }
        if (parsed.date?.$eq) {
          filterDto.date = String(parsed.date.$eq);
        }
        if (parsed.search?.$contL) {
          filterDto.search = String(parsed.search.$contL);
        }
      } catch (e) {
        this.logger.error(`Error parsing 's' parameter: ${e instanceof Error ? e.message : String(e)}`);
        throw new BadRequestException("Invalid 's' parameter: must be valid JSON");
      }
    }

    this.logger.debug(`Final filter DTO: ${JSON.stringify(filterDto)}`);

    // Now apply these filters in your service
    const bookings = await this.bookingService.getFilteredBookings(filterDto);
    return bookings;
  }

  @Post(":id/status")
  async updateStatus(@Param("id") id: string, @Body() statusUpdate: { status: string }) {
    // Make sure we're using the correct status
    return this.bookingService.updateStatus(id, statusUpdate.status as BookingStatus);
  }
}
