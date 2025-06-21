import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Booking } from "../../database/entities/booking.entity";
import { BookingLifecycleStatus } from "../../database/entities/enums";
import { BookingFilterDto } from "./dto/booking-filter.dto";

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async getFilteredBookings(filterDto: BookingFilterDto): Promise<Booking[]> {
    const queryBuilder = this.bookingRepository.createQueryBuilder("booking");

    this.logger.debug(`Received filterDto: ${JSON.stringify(filterDto)}`);

    // Apply search filter
    if (filterDto.search) {
      queryBuilder.andWhere(
        "(booking.bookingId LIKE :search OR booking.name LIKE :search OR booking.email LIKE :search)",
        { search: `%${filterDto.search}%` },
      );
    }

    // Apply status filter
    if (filterDto.status) {
      this.logger.debug(`Applying status filter: ${filterDto.status}`);
      queryBuilder.andWhere("booking.status = :status", { status: filterDto.status });
    }

    // Apply date filter
    if (filterDto.date) {
      this.logger.debug(`Applying date filter: ${filterDto.date}`);
      queryBuilder.andWhere("booking.date = :date", { date: filterDto.date });
    }

    this.logger.debug(`Generated SQL: ${queryBuilder.getSql()}`);
    this.logger.debug(`Query Parameters: ${JSON.stringify(queryBuilder.getParameters())}`);

    return await queryBuilder.getMany();
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async updatePaymentStatus(id: string, status: BookingLifecycleStatus) {
    const booking = await this.bookingRepository.findOne({ where: { bookingId: id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async updateBookingStatus(id: string, status: BookingLifecycleStatus) {
    const booking = await this.bookingRepository.findOne({ where: { bookingId: id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async updateStatus(bookingId: string, status: BookingLifecycleStatus): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    booking.status = status;
    return this.bookingRepository.save(booking);
  }
}
