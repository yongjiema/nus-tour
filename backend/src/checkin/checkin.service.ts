import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Booking } from "../database/entities/booking.entity";
import { Checkin } from "../database/entities/checkin.entity";
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

  async checkIn(checkinDto: CheckinDto): Promise<void> {
    const { bookingId, email } = checkinDto;
    this.logger.log(`Attempting check-in for bookingId: ${bookingId}`);

    const booking = await this.bookingRepository.findOne({
      where: { bookingId },
      relations: ["checkin"], // Add this to load the existing checkin relation
    });

    if (!booking) {
      this.logger.warn(`Booking with id ${bookingId} not found.`);
      throw new BadRequestException("Invalid booking details.");
    }

    if (booking.email !== email) {
      this.logger.warn(`Email mismatch for bookingId ${bookingId}: Expected ${booking.email}, got ${email}`);
      throw new BadRequestException("Invalid booking details.");
    }

    if (booking.checkin) {
      this.logger.warn(`Booking ${bookingId} has already been checked in.`);
      throw new BadRequestException("Booking has already been checked in.");
    }

    // Create a new Checkin entity
    const checkin = new Checkin();
    checkin.booking = booking;
    checkin.status = "completed";
    checkin.checkInTime = new Date();

    // Save the checkin entity
    await this.checkinRepository.save(checkin);

    this.logger.log(`Booking ${bookingId} successfully checked in.`);
  }

  async countPending(): Promise<number> {
    return this.checkinRepository.count({
      where: { status: "pending" },
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
