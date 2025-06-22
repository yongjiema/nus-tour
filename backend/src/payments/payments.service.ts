import { Injectable, NotFoundException, Logger, ForbiddenException } from "@nestjs/common";
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

  async createPayment(createPaymentDto: CreatePaymentDto, user: { id: string; email: string }): Promise<Payment> {
    this.logger.log(`Creating payment for booking: ${createPaymentDto.bookingId}`);

    // Validate if booking exists using BookingService helper (better abstraction for unit tests)
    const booking = await this.bookingService.getBookingByBookingId(String(createPaymentDto.bookingId));

    // If user provided, validate booking ownership
    if (user.email && booking.email !== user.email) {
      throw new ForbiddenException("You can only create payments for your own bookings");
    }

    // Check if payment already exists for this booking
    const existingPayment = await this.paymentsRepository.findOne({
      where: { booking: { id: booking.id } },
    });

    let payment: Payment;

    if (existingPayment) {
      // Update existing payment
      payment = existingPayment;
      if (createPaymentDto.amount !== undefined) {
        payment.amount = createPaymentDto.amount;
      }
      if (createPaymentDto.status !== undefined) {
        payment.status = createPaymentDto.status;
      }
      if (createPaymentDto.transactionId) {
        payment.transactionId = createPaymentDto.transactionId;
      }
      if (createPaymentDto.paymentMethod) {
        payment.paymentMethod = createPaymentDto.paymentMethod;
      }
    } else {
      // Create new payment
      payment = this.paymentsRepository.create({
        bookingId: booking.id,
        amount: createPaymentDto.amount ?? booking.deposit,
        status: createPaymentDto.status ?? BookingLifecycleStatus.PENDING_PAYMENT,
        transactionId: createPaymentDto.transactionId ?? `TXN-${Date.now()}`,
        paymentMethod: createPaymentDto.paymentMethod ?? "pending",
      });
    }

    const savedPayment = await this.paymentsRepository.save(payment);
    this.logger.log(`Payment record processed for booking: ${booking.id}`);
    return savedPayment;
  }

  async updatePaymentStatus(updateDto: UpdatePaymentStatusDto): Promise<Payment> {
    this.logger.log(`Updating payment status for booking: ${updateDto.bookingId}`);

    // 1. Retrieve booking based on ID type
    let booking: Booking | null;
    if (typeof updateDto.bookingId === "number") {
      booking = await this.bookingRepository.findOne({ where: { id: Number(updateDto.bookingId) } });
    } else {
      booking = await this.bookingService.getBookingByBookingId(String(updateDto.bookingId));
    }

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${updateDto.bookingId} not found`);
    }

    // 2. Retrieve or create payment linked to booking
    let payment = await this.paymentsRepository.findOne({ where: { bookingId: booking.id } });

    payment ??= this.paymentsRepository.create({
      bookingId: booking.id,
      amount: booking.deposit,
      status: BookingLifecycleStatus.PENDING_PAYMENT,
    });

    // 3. Apply updates
    payment.status = updateDto.status;
    if (updateDto.transactionId) {
      payment.transactionId = updateDto.transactionId;
    }
    if (updateDto.paymentMethod) {
      payment.paymentMethod = updateDto.paymentMethod;
    }
    payment.updatedAt = new Date();

    // 4. Persist changes
    const savedPayment = await this.paymentsRepository.save(payment);

    // 5. Update booking status if payment completed
    if (updateDto.status === BookingLifecycleStatus.PAYMENT_COMPLETED) {
      booking.status = BookingLifecycleStatus.PAYMENT_COMPLETED;
      await this.bookingRepository.save(booking);
    }

    this.logger.log(`Payment status updated successfully for booking: ${updateDto.bookingId}`);
    return savedPayment;
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

  async getPaymentByBookingId(bookingId: number | string): Promise<Payment> {
    // Determine lookup strategy based on ID type
    const booking =
      typeof bookingId === "number"
        ? await this.bookingService.getBookingById(Number(bookingId))
        : await this.bookingService.getBookingByBookingId(String(bookingId));

    const payment = await this.paymentsRepository.findOne({
      where: { bookingId: booking.id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment for booking ${bookingId} not found`);
    }

    return payment;
  }
}
