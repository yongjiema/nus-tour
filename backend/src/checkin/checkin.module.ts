import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CheckinService } from "./checkin.service";
import { CheckinController } from "./checkin.controller";
import { Checkin } from "../database/entities/checkin.entity";
import { Booking } from "../database/entities/booking.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Checkin, Booking])],
  controllers: [CheckinController],
  providers: [CheckinService],
  exports: [CheckinService],
})
export class CheckinModule {}
