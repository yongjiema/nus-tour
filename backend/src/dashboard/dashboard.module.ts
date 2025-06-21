import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { BookingModule } from "../booking/booking.module";
import { PaymentsModule } from "../payments/payments.module";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "../database/entities/booking.entity";
import { Feedback } from "../database/entities/feedback.entity";
import { Payment } from "../database/entities/payments.entity";

@Module({
  imports: [BookingModule, PaymentsModule, AuthModule, TypeOrmModule.forFeature([Booking, Feedback, Payment])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {
  onModuleInit(): void {
    // Module initialization logic if needed
  }
}
