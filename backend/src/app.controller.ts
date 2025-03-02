import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { BookingService } from './booking/booking.service';
import { CheckinService } from './checkin/checkin.service';
import { FeedbackService } from './feedback/feedback.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly checkinService: CheckinService,
    private readonly feedbackService: FeedbackService,
  ) {}

  @Get('stats')
  async getDashboardStats() {
    const totalBookings = await this.bookingService.count();
    const pendingCheckIns = await this.checkinService.countPending();
    const completedTours = await this.bookingService.countCompleted();
    const feedbacks = await this.feedbackService.count();

    return {
      totalBookings,
      pendingCheckIns,
      completedTours,
      feedbacks,
    };
  }
}
