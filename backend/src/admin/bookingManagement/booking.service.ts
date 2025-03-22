import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Booking } from "../../database/entities/booking.entity";
import { BookingStatus, PaymentStatus } from "../../database/entities/enums";
import { BookingFilterDto } from "./dto/booking-filter.dto";

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async getFilteredBookings(filterDto: BookingFilterDto): Promise<Booking[]> {
    const query = this.bookingRepository.createQueryBuilder("booking");

    console.log("Received filterDto:", filterDto);

    if (filterDto.search) {
      query.andWhere(
        '(LOWER(booking."bookingId") LIKE LOWER(:search) OR LOWER(booking.name) LIKE LOWER(:search) OR LOWER(booking.email) LIKE LOWER(:search))',
        { search: `%${filterDto.search}%` },
      );
    }

    if (filterDto.bookingStatus) {
      query.andWhere('booking."bookingStatus"::text = :bookingStatus', {
        bookingStatus: filterDto.bookingStatus,
      });
    }

    if (filterDto.paymentStatus) {
      query.andWhere('booking."paymentStatus"::text = :paymentStatus', {
        paymentStatus: filterDto.paymentStatus,
      });
    }

    if (filterDto.date) {
      query.andWhere("DATE(booking.date) = :date", { date: filterDto.date });
    }

    console.log("Generated SQL:", query.getSql());
    console.log("Query Parameters:", query.getParameters());

    return query.getMany();
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    const booking = await this.bookingRepository.findOne({ where: { bookingId: id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    booking.paymentStatus = paymentStatus;
    return this.bookingRepository.save(booking);
  }

  async updateBookingStatus(id: string, bookingStatus: BookingStatus) {
    const booking = await this.bookingRepository.findOne({ where: { bookingId: id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    booking.bookingStatus = bookingStatus;
    return this.bookingRepository.save(booking);
  }
}
