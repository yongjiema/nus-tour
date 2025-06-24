import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Booking } from "../database/entities/booking.entity";
import { Checkin } from "../database/entities/checkin.entity";
import { BookingStatus } from "../database/entities/enums";
import { CheckinDto } from "./dto/checkin.dto";

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Checkin)
    private readonly checkinRepository: Repository<Checkin>,
  ) {}

  async checkIn(checkinDto: CheckinDto): Promise<{ message: string }> {
    const { bookingId, email } = checkinDto;
    this.logger.log(`Attempting check-in for bookingId: ${bookingId}`);

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ["checkin"],
    });

    if (!booking) {
      this.logger.warn(`Booking with id ${bookingId} not found.`);
      throw new BadRequestException("Invalid booking details.");
    }

    if (booking.user.email !== email) {
      this.logger.warn(`Email mismatch for bookingId ${bookingId}: Expected ${booking.user.email}, got ${email}`);
      throw new BadRequestException("Invalid booking details.");
    }

    if (booking.checkin) {
      this.logger.warn(`Booking ${bookingId} has already been checked in.`);
      throw new BadRequestException("Booking has already been checked in.");
    }

    // Create a new Checkin entity (audit trail only)
    const checkin = new Checkin();
    checkin.booking = booking;
    checkin.checkInTime = new Date();

    // Save the checkin entity
    await this.checkinRepository.save(checkin);

    // Update booking status
    booking.status = BookingStatus.CHECKED_IN;
    await this.bookingRepository.save(booking);

    this.logger.log(`Booking ${bookingId} successfully checked in.`);
    return { message: "Check-in successful" };
  }

  async countPending(): Promise<number> {
    return this.bookingRepository.count({
      where: { status: BookingStatus.CONFIRMED },
    });
  }

  async findRecent(limit: number): Promise<Checkin[]> {
    return this.checkinRepository.find({
      relations: ["booking"],
      order: { createdAt: "DESC" },
      take: limit,
    });
  }
}
