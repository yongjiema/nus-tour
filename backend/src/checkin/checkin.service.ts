import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../database/entities/booking.entity';
import { CheckinDto } from './dto/checkin.dto';

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async checkIn(checkinDto: CheckinDto): Promise<void> {
    const { bookingId, email } = checkinDto;
    this.logger.log(`Attempting check-in for bookingId: ${bookingId}`);

    const booking = await this.bookingRepository.findOne({ where: { bookingId } });
    if (!booking) {
      this.logger.warn(`Booking with id ${bookingId} not found.`);
      throw new BadRequestException('Invalid booking details.');
    }

    if (booking.email !== email) {
      this.logger.warn(`Email mismatch for bookingId ${bookingId}: Expected ${booking.email}, got ${email}`);
      throw new BadRequestException('Invalid booking details.');
    }

    if (booking.checkedIn) {
      this.logger.warn(`Booking ${bookingId} has already been checked in.`);
      throw new BadRequestException('Booking has already been checked in.');
    }

    // Mark the booking as checked-in
    booking.checkedIn = true;
    await this.bookingRepository.save(booking);
    this.logger.log(`Booking ${bookingId} successfully checked in.`);
  }
}
