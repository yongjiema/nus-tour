import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { Payment } from "../database/entities/payments.entity";
import { User } from "../database/entities/user.entity";
import { Booking } from "../database/entities/booking.entity";
import { AuthModule } from "../auth/auth.module";
import { BookingModule } from "../booking/booking.module";

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, Booking]), AuthModule, BookingModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
