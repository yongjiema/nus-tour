import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../database/entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingValidationException, ResourceNotFoundException } from '../common/exceptions/http-exceptions';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Validate group size
    if (createBookingDto.groupSize < 1) {
      throw new BookingValidationException('Group size must be at least 1 person');
    }

    if (createBookingDto.groupSize > 50) {
      throw new BookingValidationException('Group size cannot exceed 50 people');
    }

    // Validate date - ensure it's a Date object
    const bookingDate = new Date(createBookingDto.bookingDate);
    const today = new Date();
    if (bookingDate < today) {
      throw new BookingValidationException('Booking date cannot be in the past');
    }

    // Validate time slot format
    const validTimeSlots = [
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '01:00 PM - 02:00 PM',
      '02:00 PM - 03:00 PM',
      '03:00 PM - 04:00 PM',
    ];

    if (!validTimeSlots.includes(createBookingDto.timeSlot)) {
      throw new BookingValidationException(`Invalid time slot. Valid options are: ${validTimeSlots.join(', ')}`);
    }

    // Check for existing bookings
    const existingBookings = await this.bookingRepository.count({
      where: {
        date: bookingDate, // Assuming 'date' is the column name in your entity
        timeSlot: createBookingDto.timeSlot,
      } as any,
    });

    if (existingBookings >= 3) {
      throw new BookingValidationException(`The selected time slot is fully booked. Please select another time.`);
    }

    // Create booking
    const newBooking = {
      name: createBookingDto.name,
      email: createBookingDto.email,
      date: bookingDate, // Assuming 'date' is the column name in your entity
      groupSize: createBookingDto.groupSize,
      timeSlot: createBookingDto.timeSlot,
      deposit: createBookingDto.deposit || 50,
    };

    const booking = this.bookingRepository.create(newBooking);

    // Save and return the booking
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

    // Convert string date to Date object for comparison
    const bookingDate = new Date(date);

    const availabilityPromises = allSlots.map(async (slot) => {
      const count = await this.bookingRepository.count({
        where: {
          date: bookingDate,
          timeSlot: slot,
        } as any,
      });
      return { slot, available: 5 - count };
    });

    return Promise.all(availabilityPromises);
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async getAllBookingByEmail(email: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { email },
      order: { createdAt: 'DESC' } as any,
      relations: ['payment'],
    });
  }

  async getBookingById(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new ResourceNotFoundException('Booking', id);
    }
    return booking;
  }

  async count(): Promise<number> {
    return this.bookingRepository.count();
  }

  async countCompleted(): Promise<number> {
    return this.bookingRepository.count({
      where: { paymentStatus: 'completed' },
    });
  }

  async findRecent(limit: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      order: { createdAt: 'DESC' } as any,
      take: limit,
    });
  }
}
