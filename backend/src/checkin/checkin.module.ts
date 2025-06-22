import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CheckinController } from "./checkin.controller";
import { CheckinService } from "./checkin.service";
import { Checkin } from "../database/entities/checkin.entity";
import { Booking } from "../database/entities/booking.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Checkin])],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {
  onModuleInit(): void {
    // Module initialization logic if needed
  }
}
