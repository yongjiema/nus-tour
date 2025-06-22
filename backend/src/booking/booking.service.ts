import { Injectable, NotFoundException, Inject, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Booking } from "../database/entities/booking.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingLifecycleStatus } from "../database/entities/enums";
import { Payment } from "../database/entities/payments.entity";

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @Inject(DataSource)
    private dataSource: DataSource,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      this.logger.log("Creating new booking", { dto: createBookingDto });

      // -----------------------------
      // 1. Validate date (YYYY-MM-DD) and ensure it's from tomorrow onwards
      // -----------------------------
      const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
      const match = dateRegex.exec(createBookingDto.date);
      if (!match) {
        throw new BadRequestException(
          "Invalid date components. Ensure YYYY-MM-DD and that year, month, and day are numeric.",
        );
      }

      const [_, yearStr, monthStr, dayStr] = match;
      const year = Number(yearStr);
      const month = Number(monthStr) - 1; // JS months are 0-indexed
      const day = Number(dayStr);
      const bookingDate = new Date(year, month, day);

      // Check for invalid date (e.g. 2025-02-31)
      if (Number.isNaN(bookingDate.getTime())) {
        throw new BadRequestException(
          "Invalid date components. Ensure YYYY-MM-DD and that year, month, and day are numeric.",
        );
      }

      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (bookingDate < tomorrow) {
        throw new BadRequestException("Booking date must be from tomorrow onwards");
      }

      // -----------------------------
      // 2. Validate time slot
      // -----------------------------
      const ALLOWED_TIME_SLOTS = [
        "09:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "01:00 PM - 02:00 PM",
        "02:00 PM - 03:00 PM",
        "03:00 PM - 04:00 PM",
      ];

      if (!ALLOWED_TIME_SLOTS.includes(createBookingDto.timeSlot)) {
        throw new BadRequestException("Invalid time slot");
      }

      // -----------------------------
      // 3. Check capacity for the selected slot
      // -----------------------------
      const MAX_BOOKINGS_PER_SLOT = 3;
      const existingCount = await this.bookingRepository.count({
        where: { date: bookingDate, timeSlot: createBookingDto.timeSlot },
      });

      if (existingCount >= MAX_BOOKINGS_PER_SLOT) {
        throw new BadRequestException("Selected time slot is fully booked");
      }

      // -----------------------------
      // 4. Persist booking
      // -----------------------------
      const booking = this.bookingRepository.create({
        name: createBookingDto.name,
        email: createBookingDto.email,
        date: bookingDate,
        groupSize: createBookingDto.groupSize,
        timeSlot: createBookingDto.timeSlot,
        deposit: createBookingDto.deposit ?? 50,
        status: BookingLifecycleStatus.PENDING_PAYMENT,
      });

      const savedBooking = await this.bookingRepository.save(booking);
      this.logger.log("Booking created successfully", { bookingId: savedBooking.bookingId });

      return savedBooking;
    } catch (error) {
      this.logger.error("Failed to create booking", error);
      throw error;
    }
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({
      relations: ["checkin", "payment"],
    });
  }

  async findOne(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId },
      relations: ["checkin", "payment"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  async updateBookingStatus(bookingId: string, status: BookingLifecycleStatus): Promise<Booking> {
    const booking = await this.findOne(bookingId);
    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async getBookingByEmail(email: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { email },
      order: { createdAt: "DESC" },
      relations: ["payment"],
    });
  }

  async getBookingStatistics(): Promise<{
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    completedBookings: number;
  }> {
    const [totalBookings, confirmedBookings, pendingBookings, completedBookings] = await Promise.all([
      this.bookingRepository.count(),
      this.bookingRepository.count({ where: { status: BookingLifecycleStatus.CONFIRMED } }),
      this.bookingRepository.count({ where: { status: BookingLifecycleStatus.PENDING_PAYMENT } }),
      this.bookingRepository.count({ where: { status: BookingLifecycleStatus.COMPLETED } }),
    ]);

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      completedBookings,
    };
  }

  async getBookingWithPayment(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId },
      relations: ["payment"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  async updateBookingPayment(
    bookingId: string,
    paymentData: {
      transactionId: string;
      amount: number;
      status: BookingLifecycleStatus;
      paymentMethod: string;
    },
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { bookingId },
        relations: ["payment"],
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${bookingId} not found`);
      }

      // Update booking status
      booking.status = BookingLifecycleStatus.PAYMENT_COMPLETED;

      // Create or update payment record
      let payment = booking.payment;
      if (!payment) {
        payment = manager.create(Payment, {
          bookingId: booking.id,
          transactionId: paymentData.transactionId,
          amount: paymentData.amount,
          status: paymentData.status,
          paymentMethod: paymentData.paymentMethod,
          booking,
        });
      } else {
        payment.transactionId = paymentData.transactionId;
        payment.amount = paymentData.amount;
        payment.status = paymentData.status;
        payment.paymentMethod = paymentData.paymentMethod;
      }

      await manager.save(Booking, booking);
      await manager.save(Payment, payment);
    });
  }

  // Legacy/compatibility wrapper methods ---------------------------

  /**
   * Returns available time slots for a given date.
   * For now this is a simplified implementation that always reports a max capacity of 5 per slot.
   */
  async getAvailableTimeSlots(date: string): Promise<{ slot: string; available: number }[]> {
    const allSlots = [
      "09:00 AM - 10:00 AM",
      "10:00 AM - 11:00 AM",
      "11:00 AM - 12:00 PM",
      "01:00 PM - 02:00 PM",
      "02:00 PM - 03:00 PM",
      "03:00 PM - 04:00 PM",
    ];

    const bookingDate = new Date(date);

    const results: { slot: string; available: number }[] = [];

    for (const slot of allSlots) {
      const count = await this.bookingRepository.count({ where: { date: bookingDate, timeSlot: slot } });
      results.push({ slot, available: Math.max(5 - count, 0) });
    }

    return results;
  }

  /** Alias to findAll() kept for backward compatibility */
  async getAllBookings(): Promise<Booking[]> {
    return this.findAll();
  }

  /** Alias to getBookingByEmail() kept for backward compatibility */
  async getAllBookingByEmail(email: string): Promise<Booking[]> {
    return this.getBookingByEmail(email);
  }

  /** Get booking by numeric ID */
  async getBookingById(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id }, relations: ["payment"] });
    if (!booking) {
      throw new NotFoundException(`Booking with numeric ID ${id} not found`);
    }
    return booking;
  }

  /** Alias to findOne by bookingId */
  async getBookingByBookingId(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId },
      relations: ["payment"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  /** Legacy count helper */
  async count(): Promise<number> {
    return this.bookingRepository.count();
  }

  /** Legacy countCompleted helper */
  async countCompleted(): Promise<number> {
    // Using query builder to match legacy tests
    const qb = this.bookingRepository.createQueryBuilder("booking");
    return qb.where("booking.status = :status", { status: BookingLifecycleStatus.COMPLETED }).getCount();
  }

  /** Get recently created bookings */
  async findRecent(limit: number): Promise<Booking[]> {
    return this.bookingRepository.find({ order: { createdAt: "DESC" }, take: limit });
  }

  /** Legacy UUID helper (bookingId is already UUID) */
  async getBookingByUuid(uuid: string): Promise<Booking | null> {
    try {
      return await this.bookingRepository.findOne({
        where: { bookingId: uuid },
        relations: ["payment"],
      });
    } catch {
      return null;
    }
  }

  /** Legacy wrapper for updateStatus */
  async updateStatus(bookingId: string, status: BookingLifecycleStatus): Promise<Booking> {
    return this.updateBookingStatus(bookingId, status);
  }

  /** Legacy wrapper combining payment and status update */
  async updatePaymentAndBookingStatus(
    bookingId: string,
    status: BookingLifecycleStatus,
    paymentInfo: {
      transactionId: string;
      amount: number;
      method: string;
      userId: number;
    },
  ): Promise<Booking> {
    await this.updateBookingPayment(bookingId, {
      transactionId: paymentInfo.transactionId,
      amount: paymentInfo.amount,
      status,
      paymentMethod: paymentInfo.method,
    });
    return this.findOne(bookingId);
  }
}
