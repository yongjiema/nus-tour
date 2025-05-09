import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/role.decorator";
import { DashboardService } from "./dashboard.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Booking } from "../database/entities/booking.entity";
import { BookingLifecycleStatus } from "../database/entities/enums";
import { MoreThanOrEqual } from "typeorm";

@Controller("admin/dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  @Get("stats")
  async getStats() {
    try {
      // Use the improved implementation instead of the service method
      const [totalBookings, pendingCheckIns, completedTours, feedbacks] = await Promise.all([
        this.bookingRepository.count(),

        // Find confirmed bookings that haven't been checked in yet
        this.bookingRepository.count({
          where: {
            status: BookingLifecycleStatus.CONFIRMED,
            date: MoreThanOrEqual(new Date()),
          },
        }),

        // Count completed tours
        this.bookingRepository.count({
          where: {
            status: BookingLifecycleStatus.COMPLETED,
          },
        }),

        // Count bookings with feedback
        this.bookingRepository.count({
          where: {
            hasFeedback: true,
          },
        }),
      ]);

      const stats = {
        totalBookings,
        pendingCheckIns,
        completedTours,
        feedbacks,
      };

      console.log("Dashboard stats:", stats);
      return { data: stats };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  @Get("recent-activity")
  async getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }
}
