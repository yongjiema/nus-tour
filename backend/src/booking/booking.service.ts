import { Injectable, NotFoundException, Inject, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Booking } from "../database/entities/booking.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingStatus } from "../database/entities/enums";
import { Payment } from "../database/entities/payments.entity";
import { User } from "../database/entities/user.entity";
import { TimeSlot } from "../database/entities/timeSlot.entity";

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(TimeSlot)
    private timeSlotRepository: Repository<TimeSlot>,
    @Inject(DataSource)
    private dataSource: DataSource,
  ) {}

  async createBooking(
    createBookingDto: CreateBookingDto,
    userContext?: { id: string; email: string; firstName?: string; lastName?: string },
  ): Promise<Booking> {
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
      // 2. Validate time slot via DB lookup & capacity check
      // -----------------------------
      const { startsAt, endsAt } = this.parseTimeSlotLabel(createBookingDto.timeSlot);
      const timeSlotEntity = await this.timeSlotRepository.findOne({ where: { startsAt, endsAt } });

      if (!timeSlotEntity) {
        throw new BadRequestException("Invalid time slot");
      }

      // -----------------------------
      // 3. Check capacity for the selected slot (uses capacity from DB)
      // -----------------------------
      const existingCount = await this.bookingRepository.count({
        where: { date: bookingDate, timeSlot: timeSlotEntity.label },
      });

      if (existingCount >= timeSlotEntity.capacity) {
        throw new BadRequestException("Selected time slot is fully booked");
      }

      // -----------------------------
      // 4. Persist booking
      // -----------------------------
      const booking = this.bookingRepository.create({
        date: bookingDate,
        groupSize: createBookingDto.groupSize,
        timeSlot: timeSlotEntity.label,
        deposit: createBookingDto.deposit ?? 50,
        status: BookingStatus.AWAITING_PAYMENT,
        user: { id: userContext?.id } as User,
      });

      const savedBooking = await this.bookingRepository.save(booking);
      this.logger.log("Booking created successfully", { bookingId: savedBooking.id });

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
      where: { id: bookingId },
      relations: ["checkin", "payment"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.findOne(bookingId);
    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async getBookingStatistics(): Promise<{
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    completedBookings: number;
  }> {
    const [totalBookings, confirmedBookings, pendingBookings, completedBookings] = await Promise.all([
      this.bookingRepository.count(),
      this.bookingRepository.count({ where: { status: BookingStatus.CONFIRMED } }),
      this.bookingRepository.count({ where: { status: BookingStatus.AWAITING_PAYMENT } }),
      this.bookingRepository.count({ where: { status: BookingStatus.COMPLETED } }),
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
      where: { id: bookingId },
      relations: ["payment", "user"],
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
      status: BookingStatus;
      paymentMethod: string;
    },
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id: bookingId },
        relations: ["payment"],
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${bookingId} not found`);
      }

      booking.status = paymentData.status;

      // Create or update payment record
      let payment = booking.payment;
      if (!payment) {
        payment = manager.create(Payment, {
          bookingId: booking.id,
          transactionId: paymentData.transactionId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          booking,
        });
      } else {
        payment.transactionId = paymentData.transactionId;
        payment.amount = paymentData.amount;
        payment.paymentMethod = paymentData.paymentMethod;
      }

      await manager.save(Booking, booking);
      await manager.save(Payment, payment);
    });
  }

  /**
   * Returns available time slots for a given date.
   * Capacity and slot definitions are fetched dynamically from the `time_slot` table,
   * allowing them to be managed without code changes.
   */
  async getAvailableTimeSlots(date: string): Promise<{ slot: string; available: number }[]> {
    const allSlots = await this.timeSlotRepository.find();

    const bookingDate = new Date(date);

    const results: { slot: string; available: number }[] = [];

    for (const slotEntity of allSlots) {
      const count = await this.bookingRepository.count({ where: { date: bookingDate, timeSlot: slotEntity.label } });
      results.push({ slot: slotEntity.label, available: Math.max(slotEntity.capacity - count, 0) });
    }

    return results;
  }

  /** Retrieve all bookings for a given user e-mail */
  async findAllByEmail(email: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { user: { email } as unknown as User },
      order: { createdAt: "DESC" },
      relations: ["payment", "user"],
    });
  }

  /** Retrieve a booking by its UUID (`bookingId`). */
  async getBookingById(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ["payment", "user"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  /** Count total bookings */
  async count(): Promise<number> {
    return this.bookingRepository.count();
  }

  /** Count bookings with COMPLETED status */
  async countCompleted(): Promise<number> {
    // Uses query builder for compatibility with older tests
    const qb = this.bookingRepository.createQueryBuilder("booking");
    return qb.where("booking.status = :status", { status: BookingStatus.COMPLETED }).getCount();
  }

  /** Get recently created bookings */
  async findRecent(limit: number): Promise<Booking[]> {
    return this.bookingRepository.find({ order: { createdAt: "DESC" }, take: limit });
  }

  /** Helper when only bookingId is available (already UUID) */
  async getBookingByUuid(uuid: string): Promise<Booking | null> {
    try {
      return await this.bookingRepository.findOne({
        where: { id: uuid },
        relations: ["payment"],
      });
    } catch {
      return null;
    }
  }

  /** Convenience method combining payment update and status change */
  async updatePaymentAndBookingStatus(
    bookingId: string,
    status: BookingStatus,
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

  /**
   * Retrieve all bookings belonging to a specific user.
   * This is the preferred method moving forward.
   */
  async getAllBookingByUserId(userId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { user: { id: userId } as unknown as User },
      order: { createdAt: "DESC" },
      relations: ["payment", "user"],
    });
  }

  /**
   * Convert a string like "09:00 AM" to a DB time literal "09:00:00" (24-hour).
   */
  private toDbTime(timeLabel: string): string {
    if (!timeLabel) {
      throw new BadRequestException("Invalid time format");
    }
    const [timePart, period] = timeLabel.trim().split(" ");
    if (!timePart || !period) {
      throw new BadRequestException("Invalid time format");
    }
    const [hourStr, minuteStr] = timePart.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      throw new BadRequestException("Invalid time format");
    }
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
  }

  /**
   * Split a label like "09:00 AM - 10:00 AM" into DB start/end times.
   */
  private parseTimeSlotLabel(label: string): { startsAt: string; endsAt: string } {
    if (label === "" || !label.includes("-")) {
      throw new BadRequestException("Invalid time slot format");
    }
    const parts = label.split("-").map((v) => v.trim());
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new BadRequestException("Invalid time slot format");
    }
    const [startLabel, endLabel] = parts;
    return { startsAt: this.toDbTime(startLabel), endsAt: this.toDbTime(endLabel) };
  }
}
