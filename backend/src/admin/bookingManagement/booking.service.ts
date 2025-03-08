import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../database/entities/booking.entity';
import { BookingStatus } from '../../database/entities/enums';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async getFilteredBookings(search?: string, status?: string, date?: string) {
    const query = this.bookingRepository.createQueryBuilder('booking');

    if (search) {
      query.andWhere('booking.name ILIKE :search OR booking.bookingId ILIKE :search', { search: `%${search}%` });
    }
    if (status) {
      query.andWhere('booking.status = :status', { status });
    }
    if (date) {
      query.andWhere('booking.date = :date', { date });
    }

    return query.getMany();
  }

  async findAll() {
    return this.bookingRepository.find();
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
