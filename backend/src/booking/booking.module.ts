import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "../database/entities/booking.entity";
import { BookingService } from "./booking.service";
import { BookingController } from "./booking.controller";
import { AuthModule } from "../auth/auth.module";
import { Checkin } from "../database/entities/checkin.entity";
import { Payment } from "../database/entities/payments.entity";
import { TimeSlot } from "../database/entities/timeSlot.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Checkin, Payment, TimeSlot]), AuthModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {
  onModuleInit(): void {
    // Module initialization logic if needed
  }
}
