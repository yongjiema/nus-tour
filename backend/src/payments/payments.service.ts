import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Payment } from '../database/entities/payments.entity';
import { User } from '../database/entities/user.entity';
import { Booking } from '../database/entities/booking.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async createPayment(bookingId: string, amount: number): Promise<Payment> {
    const payment = this.paymentsRepository.create({
      booking: { id: parseInt(bookingId, 10) },
      amount,
    });
    return this.paymentsRepository.save(payment);
  }

  async confirmPayment(bookingId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { booking: { id: parseInt(bookingId, 10) } },
    });
    if (!payment) {
      throw new Error('Payment not found');
    }
    payment.paymentStatus = 'Paid';
    return this.paymentsRepository.save(payment);
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    // Get the user first to find their email
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find bookings by email
    const bookings = await this.bookingRepository.find({
      where: { email: user.email },
      select: ['id'],
    });

    if (bookings.length === 0) {
      return [];
    }

    // Get booking IDs
    const bookingIds = bookings.map((booking) => booking.id);

    // Find payments for these bookings
    return this.paymentsRepository.find({
      where: { booking: { id: In(bookingIds) } },
      order: { createdAt: 'DESC' },
      relations: ['booking'],
    });
  }

  async getPaymentByBookingId(bookingId: number): Promise<Payment> {
    return this.paymentsRepository.findOne({
      where: { booking: { id: bookingId } },
    });
  }
}
