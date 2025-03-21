import { Module } from "@nestjs/common";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "../../database/entities/booking.entity";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "../../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your_secret_key",
      signOptions: { expiresIn: "1h" },
    }),
    AuthModule,
  ], // Register Booking entity and AuthModule
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingManagementModule {}
