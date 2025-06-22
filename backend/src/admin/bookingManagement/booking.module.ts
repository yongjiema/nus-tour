import { Module } from "@nestjs/common";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "../../database/entities/booking.entity";
import { AuthModule } from "../../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), AuthModule], // Register Booking entity and AuthModule
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingManagementModule {
  configure() {
    // Admin booking module configuration
  }
}
