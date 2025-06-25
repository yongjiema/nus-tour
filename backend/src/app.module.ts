import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { BookingModule } from "./booking/booking.module";
import { PaymentsModule } from "./payments/payments.module";
import { BookingManagementModule } from "./admin/bookingManagement/booking.module";
import { CheckinModule } from "./checkin/checkin.module";
import { FeedbackModule } from "./feedback/feedback.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DatabaseSeedModule } from "./database/seed/database-seed.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BookingModule,
    PaymentsModule,
    FeedbackModule,
    DashboardModule,
    CheckinModule,
    BookingManagementModule,
    ...(process.env.NODE_ENV !== "production" ? [DatabaseSeedModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure() {
    // Application module configuration
  }
}
