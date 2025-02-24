import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../database/entities/booking.entity';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
