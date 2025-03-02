import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Payment } from '../database/entities/payments.entity';
import { User } from '../database/entities/user.entity';
import { Booking } from '../database/entities/booking.entity';
import { PaymentStatus } from '../database/entities/enums';
import { BookingService } from '../booking/booking.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { BookingStatus } from '../database/entities/enums';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private bookingService: BookingService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    this.logger.log(`Creating payment for booking: ${createPaymentDto.bookingId}`);

    const booking = await this.bookingService.getBookingById(createPaymentDto.bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${createPaymentDto.bookingId} not found`);
    }

    // Check if payment already exists
    const existingPayment = await this.paymentsRepository.findOne({
      where: { bookingId: booking.id },
    });

    if (existingPayment) {
      this.logger.log(`Payment already exists for booking: ${booking.id}, updating status`);
      return this.updatePaymentStatus({
        bookingId: booking.id,
        status: createPaymentDto.status || PaymentStatus.PENDING,
        transactionId: createPaymentDto.transactionId,
        paymentMethod: createPaymentDto.paymentMethod,
      });
    }

    // Create new payment
    const payment = this.paymentsRepository.create({
      bookingId: booking.id,
      amount: createPaymentDto.amount || booking.deposit,
      status: createPaymentDto.status || PaymentStatus.PENDING,
      transactionId: createPaymentDto.transactionId,
      paymentMethod: createPaymentDto.paymentMethod,
    });

    const savedPayment = await this.paymentsRepository.save(payment);
    this.logger.log(`Payment created for booking: ${booking.id}`);

    return savedPayment;
  }

  async updatePaymentStatus(updateDto: UpdatePaymentStatusDto): Promise<Payment> {
    this.logger.log(`Updating payment status for booking: ${updateDto.bookingId} to ${updateDto.status}`);

    const booking = await this.bookingRepository.findOne({
      where: { id: updateDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id ${updateDto.bookingId} not found`);
    }

    let payment = await this.paymentsRepository.findOne({
      where: { bookingId: updateDto.bookingId },
    });

    if (!payment) {
      this.logger.warn(`No payment found for booking: ${updateDto.bookingId}, creating one`);
      payment = this.paymentsRepository.create({
        bookingId: booking.id,
        amount: booking.deposit,
        status: PaymentStatus.PENDING,
      });
    }

    // Update payment
    payment.status = updateDto.status;
    if (updateDto.transactionId) {
      payment.transactionId = updateDto.transactionId;
    }
    if (updateDto.paymentMethod) {
      payment.paymentMethod = updateDto.paymentMethod;
    }

    // Update booking status (not paymentStatus)
    booking.bookingStatus =
      updateDto.status === PaymentStatus.COMPLETED ? BookingStatus.CONFIRMED : BookingStatus.PENDING;
    await this.bookingRepository.save(booking);

    const updatedPayment = await this.paymentsRepository.save(payment);
    this.logger.log(`Payment status updated for booking: ${booking.id}`);

    return updatedPayment;
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
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
    const payment = await this.paymentsRepository.findOne({
      where: { bookingId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment for booking ${bookingId} not found`);
    }

    return payment;
  }
}
