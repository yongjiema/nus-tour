import { Injectable, Logger, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Payment } from "../database/entities/payments.entity";
import { User } from "../database/entities/user.entity";
import { Booking } from "../database/entities/booking.entity";
import { BookingService } from "../booking/booking.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";
import { BookingLifecycleStatus } from "../database/entities/enums";

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

  async createPayment(createPaymentDto: CreatePaymentDto, user: any): Promise<Payment> {
    this.logger.log(`Creating payment for booking: ${createPaymentDto.bookingId}`);

    // First get the booking
    let booking;
    try {
      booking = await this.bookingService.getBookingByBookingId(String(createPaymentDto.bookingId));
    } catch (error) {
      this.logger.error(`Booking not found: ${createPaymentDto.bookingId}`, error);
      throw new NotFoundException(`Booking with id ${createPaymentDto.bookingId} not found`);
    }

    // Verify the authenticated user owns this booking
    if (booking.email !== user.email) {
      this.logger.warn(`User ${user.email} attempted unauthorized payment for booking ${booking.id}`);
      throw new ForbiddenException("You do not have permission to make payments for this booking");
    }

    // Check if payment already exists
    const existingPayment = await this.paymentsRepository.findOne({
      where: { bookingId: booking.id },
    });

    if (existingPayment) {
      this.logger.log(`Payment already exists for booking: ${booking.id}, updating status`);
      return this.updatePaymentStatus({
        bookingId: booking.id,
        status: createPaymentDto.status || BookingLifecycleStatus.PENDING_PAYMENT,
        transactionId: createPaymentDto.transactionId,
        paymentMethod: createPaymentDto.paymentMethod,
      });
    }

    // Create new payment
    const payment = this.paymentsRepository.create({
      bookingId: booking.id,
      amount: createPaymentDto.amount || booking.deposit,
      status: createPaymentDto.status || BookingLifecycleStatus.PENDING_PAYMENT,
      transactionId: createPaymentDto.transactionId,
      paymentMethod: createPaymentDto.paymentMethod,
    });

    try {
      const savedPayment = await this.paymentsRepository.save(payment);
      this.logger.log(`Payment created for booking: ${booking.id}`);
      return savedPayment;
    } catch (error) {
      console.error("Payment processing failed:", error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  async updatePaymentStatus(updateDto: UpdatePaymentStatusDto): Promise<Payment> {
    this.logger.log(`Updating payment status for booking: ${updateDto.bookingId} to ${updateDto.status}`);

    // Try to find booking by numeric ID first
    let booking;
    try {
      // If it's a number, try direct lookup
      if (typeof updateDto.bookingId === "number") {
        booking = await this.bookingRepository.findOne({
          where: { id: updateDto.bookingId },
        });
      }
      // If it's a string, check if it's a UUID
      else {
        booking = await this.bookingService.getBookingByBookingId(updateDto.bookingId);
      }
    } catch (err) {
      this.logger.error(`Failed to find booking: ${updateDto.bookingId}`, err.message);
      throw new NotFoundException(`Booking with id ${updateDto.bookingId} not found`);
    }

    if (!booking) {
      throw new NotFoundException(`Booking with id ${updateDto.bookingId} not found`);
    }

    let payment = await this.paymentsRepository.findOne({
      where: { bookingId: booking.id },
    });

    if (!payment) {
      this.logger.warn(`No payment found for booking: ${booking.id}, creating one`);
      payment = this.paymentsRepository.create({
        bookingId: booking.id,
        amount: booking.deposit,
        status: BookingLifecycleStatus.PENDING_PAYMENT,
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
    booking.status =
      updateDto.status === BookingLifecycleStatus.PAYMENT_COMPLETED
        ? BookingLifecycleStatus.CONFIRMED
        : BookingLifecycleStatus.PENDING_PAYMENT;
    await this.bookingRepository.save(booking);

    const updatedPayment = await this.paymentsRepository.save(payment);
    this.logger.log(`Payment status updated for booking: ${booking.id}`);

    return updatedPayment;
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    this.logger.log(`Finding payments for user ID: ${userId}`);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`User not found with ID: ${userId}`);
      return [];
    }

    // Find bookings by email
    const bookings = await this.bookingRepository.find({
      where: { email: user.email },
      select: ["id"],
    });

    if (bookings.length === 0) {
      this.logger.log(`No bookings found for user ${user.email}`);
      return [];
    }

    // Get booking IDs
    const bookingIds = bookings.map((booking) => booking.id);
    this.logger.log(`Found ${bookingIds.length} bookings for user`);

    // Find payments for these bookings
    const payments = await this.paymentsRepository.find({
      where: { booking: { id: In(bookingIds) } },
      order: { createdAt: "DESC" },
      relations: ["booking"],
    });

    this.logger.log(`Found ${payments.length} payments for user`);
    return payments;
  }

  async getPaymentByBookingId(bookingId: number): Promise<Payment> {
    // First try to find the booking, which could be stored with a UUID
    let booking;
    try {
      booking = await this.bookingService.getBookingById(bookingId);
    } catch (err) {
      this.logger.warn(`Booking with numeric ID ${bookingId} not found, trying UUID lookup: ${err.message}`);
      try {
        // Try with string in case it's a UUID
        booking = await this.bookingService.getBookingByBookingId(String(bookingId));
      } catch (err2) {
        this.logger.error(`Payment lookup failed: Booking ${bookingId} not found: ${err2.message}`);
        throw new NotFoundException(`Payment for booking ${bookingId} not found - booking does not exist`);
      }
    }

    // Now get the payment using the booking's numeric ID
    const payment = await this.paymentsRepository.findOne({
      where: { bookingId: booking.id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment for booking ${bookingId} not found`);
    }

    return payment;
  }
}
