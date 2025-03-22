import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "../database/entities/booking.entity";
import { User } from "../database/entities/user.entity";
import { Feedback } from "../database/entities/feedback.entity";
import { Payment } from "../database/entities/payments.entity";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, Feedback, Payment]), AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
