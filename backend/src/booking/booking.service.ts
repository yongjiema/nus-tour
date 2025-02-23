// src/booking/booking.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../database/entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingRepository.create(createBookingDto);

    if (createBookingDto.groupSize < 1 || createBookingDto.groupSize > 20) {
      throw new BadRequestException('Invalid group size. Please provide a value between 1 and 50.');
    }

    return await this.bookingRepository.save(booking);
  }

  async getAvailableTimeSlots(date: string): Promise<{ slot: string; available: number }[]> {
    const allSlots = [
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '01:00 PM - 02:00 PM',
      '02:00 PM - 03:00 PM',
      '03:00 PM - 04:00 PM',
    ];

    const availabilityPromises = allSlots.map(async (slot) => {
      const count = await this.bookingRepository.count({
        where: { date, timeSlot: slot },
      });
      return { slot, available: 5 - count };
    });

    return await Promise.all(availabilityPromises);
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async getBookingById(id: number): Promise<Booking> {
    return this.bookingRepository.findOne({ where: { id } });
  }
}
