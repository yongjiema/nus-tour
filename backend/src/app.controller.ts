import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { BookingService } from "./booking/booking.service";
import { CheckinService } from "./checkin/checkin.service";
import { FeedbackService } from "./feedback/feedback.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  getHealth() {
    return {
      status: "ok",
      environment: process.env.NODE_ENV ?? "development",
    };
  }
}

@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly checkinService: CheckinService,
    private readonly feedbackService: FeedbackService,
  ) {}

  @Get("stats")
  async getDashboardStats() {
    const bookingStats = await this.bookingService.getBookingStatistics();
    const pendingCheckIns = await this.checkinService.countPending();
    const feedbacks = await this.feedbackService.count();

    return {
      totalBookings: bookingStats.totalBookings,
      pendingCheckIns,
      completedTours: bookingStats.completedBookings,
      feedbacks,
    };
  }
}
